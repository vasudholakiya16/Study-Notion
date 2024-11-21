const e = require('express');
const Tag = require('../models/Tags');
// create tag handler function

exports.createTag = async (req, res) => {
    try {
        // get tag name from req.body and decreption in our body
        const {name, description} = req.body;
        // add validition
        if(!name || !description){
            return res.status(400).json({ success: false, message: 'Tag name and description is required' });
        }

        // create entry in db
        const tagDetails = await Tag.create({
            name:name,
            description:description,
        });
        console.log(tagDetails);
        // send a response
        return res.status(200).json({ success: true, message: 'Tag created successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
        
    }
};

// get all tags handler function

exports.showAllTags = async (req, res) => {
    try {
        const allTags = await Tag.find({},{name:true, description:true}); // get only name and description
        console.log(allTags);
        return res.status(200).json({ success: true, tags: allTags, message: 'All tags return successfully ' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};