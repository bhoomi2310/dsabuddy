import { Schema, model } from "mongoose";

const questionSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    difficulty: {
        type: String,
        required: true,
        enum: ['Easy', 'Medium', 'Hard'],
        index: true,
    },
    tags: [{
        type: String,
        trim: true,
        index: true,
    }],
    company: [{
        type: String,
        trim: true,
        index: true,
    }],
    relatedQuestions: [{
        type: Schema.Types.ObjectId,
        ref: 'question',
    }],
    // Additional metadata
    platform: {
        type: String,
        enum: ['LeetCode', 'Codeforces', 'CodeChef', 'HackerRank', 'GFG', 'Custom'],
        default: 'Custom',
    },
    platformId: {
        type: String,
        trim: true,
    },
    // Statistics
    solvedCount: {
        type: Number,
        default: 0,
    },
    acceptanceRate: {
        type: Number,
        min: 0,
        max: 100,
    },
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for efficient querying
questionSchema.index({ difficulty: 1, tags: 1 });
questionSchema.index({ company: 1 });
questionSchema.index({ title: 'text', description: 'text' });

const Question = model('question', questionSchema);
export default Question;
