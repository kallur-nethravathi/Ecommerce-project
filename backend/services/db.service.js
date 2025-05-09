import mongoose, { Model } from 'mongoose';
import { encryptField, sign, decryptField } from '../utils/encryption.js';
 class DatabaseService {
    static #instance;

    constructor() {
        console.log("🚀 DatabaseService Initialized...");
        this.keyVersion = process.env.KEY_VERSION;
        this.keyLabel = process.env.KEY_LABEL;  
    }
    static getInstance() {
        console.log("✅ Creating a new DatabaseService instance...");
        if (!DatabaseService.#instance) {
            DatabaseService.#instance = new DatabaseService();
        }
        return DatabaseService.#instance;
    }
     #encryptSensitiveData(Model, data) {
        const modelFields = Object.keys(Model.schema.paths)
            .filter(field => field.endsWith('_ds') || field.endsWith('_bi'));
        
        for (const modelField of modelFields) {
            const fieldKey = modelField.replace(/_(ds|bi)$/, '');
            if (fieldKey in data && data[fieldKey] != null && data[fieldKey] != undefined) {
                if (modelField.endsWith('_ds')) {
                    let encryptedField = encryptField(data[fieldKey]);
                    data[modelField] = encryptedField.signature;
                    data[fieldKey + "_original"] = data[fieldKey];
                    data[fieldKey] = encryptedField.data;
                }

                if (modelField.endsWith('_bi')) {
                    data[modelField] = sign(data[fieldKey + "_original"]);
                    delete data[fieldKey + "_original"];
                }
            }
        }
        if (modelFields.length > 0) {
            
            data['key_version'] = this.keyVersion;
            data['key_label'] = this.keyLabel;
        }
       
        return data;
    }

    #decryptData(Model, data) {
        if (!data) return data;

        const plainData = data.toObject ? data.toObject() : data;
        const modelFields = Object.keys(Model.schema.paths)
            .filter(field => field.endsWith('_ds') || field.endsWith('_bi'));

        for (const modelField of modelFields) {
            const fieldKey = modelField.replace(/_(ds|bi)$/, '');
            if (plainData.hasOwnProperty(fieldKey) && plainData[fieldKey] != null && plainData[fieldKey] != undefined) {
                if (modelField.endsWith('_ds')) {
                    plainData[fieldKey] = decryptField(plainData[fieldKey], plainData[modelField]);
                }
            }
            delete plainData[modelField];
        }

        return plainData;
    }

    #cleanQuery(query) {
        return Object.fromEntries(Object.entries(query).filter(([_, v]) => v !== undefined));
    }

    async create(Model, data, session = null) {
        const document = new Model(this.#encryptSensitiveData(Model, data));
        const savedDoc = session ? 
            await document.save({ session }) : 
            await document.save();
        return this.#decryptData(Model, savedDoc);
    }

    async findOne(Model, query, sortOptions = {}, projectionOptions = {}) {
        const doc = await Model.findOne(query)
            .sort(sortOptions)
            .select(projectionOptions)
            .lean();
        return this.#decryptData(Model, doc);
    }

    async findAll(Model, query = {}, options = {}, projection = null,select=null) {
        const { page = null, limit = null, sort = null } = options;
        const skip = page ? (page - 1) * limit : 0;

        const [docs, totalDocs] = await Promise.all([
            Model.find(this.#cleanQuery(query), projection)
                .lean()
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .select(select)
                .exec(),
            Model.countDocuments(this.#cleanQuery(query)).exec(),
        ]);

        // const decryptedDocs = docs.map(doc => this.#decryptData(Model, doc));

        return {
            docs: docs,
            pagination:{
                totalDocs,
                totalPages: limit ? Math.ceil(totalDocs / limit) : 1,
                currentPage: page || 1,
            
            }
            };
    }

    async update(Model, id, updateData, session = null) {
        const updatedDoc = await Model.findOneAndUpdate(
            id,
             updateData,
            { new: true, session }
        );
        return this.#decryptData(Model, updatedDoc);
    }

    async updateMany(Model, query, updateData, session = null) {
        return await Model.updateMany(
            query,
            updateData,
            { session }
        );
    }

    async aggregate(model, pipeline,hint=null,options=null) {
        try {
          // Execute the aggregation with the provided pipeline
          const docs = await model.aggregate(pipeline).hint(hint);
          // For pagination metadata, we need to run a count query
          // Remove any $skip and $limit stages from the counting pipeline
          const countPipeline = pipeline.filter(stage => 
            !Object.keys(stage).includes('$skip') && 
            !Object.keys(stage).includes('$limit')
          );
          
          // Add a count stage
          countPipeline.push({ $count: 'totalDocs' });
          
          // Execute the count query
          const countResult = await model.aggregate(countPipeline);
          const totalDocs = countResult.length > 0 ? countResult[0].totalDocs : 0;
          
          // Calculate pagination metadata
          // Find the limit in the original pipeline
          const limitStage = pipeline.find(stage => Object.keys(stage).includes('$limit'));
          const skipStage = pipeline.find(stage => Object.keys(stage).includes('$skip'));
          
          const limit = limitStage ? limitStage.$limit : docs.length;
          const skip = skipStage ? skipStage.$skip : 0;
          const currentPage = skip / limit + 1;
          const totalPages = Math.ceil(totalDocs / limit);
          
          // Return in the format expected by your application
          return {
            docs,
            totalDocs,
            totalPages,
            currentPage
          };
        } catch (error) {
          console.error('Aggregation error:', error);
          throw error;
        }
      }
    async delete(Model, id) {
        return await Model.findOneAndDelete(id);
    }

    async checkRecordExists(Model, filter) {
        const doc = await Model.findOne(filter).lean();
        return this.#decryptData(Model, doc);
    }

    async executeTransaction(operations) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const results = await Promise.all(
                operations.filter(o => o!=null).map(operation => operation(session))
            );
            await session.commitTransaction();
            return results;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async insertAll(Model, dataArray, session = null) {
        if (!Array.isArray(dataArray) || dataArray.length === 0) {
            throw new Error("insertAll requires a non-empty array of documents.");
        }
    
        // Ensure encryption if required before insertion
        const encryptedDataArray = dataArray.map(data => this.#encryptSensitiveData(Model, data));
    
        const result = session
            ? await Model.insertMany(encryptedDataArray, { session })
            : await Model.insertMany(encryptedDataArray);
    
        return result.map(doc => this.#decryptData(Model, doc));
    }

    async find(Model, query, sortOptions = {}, projectionOptions = {}) {
        const docs = await Model.find(query)  // Note: .find() not .findOne()
            .sort(sortOptions)
            .select(projectionOptions)
            .lean();
       
        if (!docs) return [];
       
        return Array.isArray(docs)
            ? docs.map(docs => this.#decryptData(Model, docs))
            : [this.#decryptData(Model, docs)];
    }
    
    
}

export default DatabaseService;
