const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csvtojson');
const xlsx = require('xlsx');
const Agent = require('../models/Agent');
const DistributedList = require('../models/DistributedList');
const auth = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' , limits: { fileSize: 10 * 1024 * 1024 } });

function parseXlsx(filePath){
  const wb = xlsx.readFile(filePath);
  const firstSheet = wb.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(wb.Sheets[firstSheet], { defval: '' });
  return data;
}

router.post('/', auth, upload.single('file'), async (req,res)=>{
  try{
    if(!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const allowed = ['.csv','.xlsx','.xls','axls','axl'];
    const ext = path.extname(req.file.originalname).toLowerCase();
    if(!allowed.includes(ext)){
      // accept axls/axl names too
      if(!['.csv','.xlsx','.xls'].includes(ext)) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: 'Invalid file type' });
      }
    }
    let rows = [];
    if(ext === '.csv'){
      rows = await csv().fromFile(req.file.path);
    } else {
      rows = parseXlsx(req.file.path);
    }
    // Basic validation: expect FirstName, Phone, Notes headers (case-insensitive)
    rows = rows.map(r => {
      // normalize keys
      const keys = Object.keys(r);
      const obj = {};
      // try common header names
      const firstKey = keys.find(k => /first/i.test(k)) || keys[0];
      const phoneKey = keys.find(k => /phone|mobile|contact/i.test(k)) || keys[1];
      const notesKey = keys.find(k => /note/i.test(k)) || keys[2];
      obj.firstName = (r[firstKey] || '').toString();
      obj.phone = (r[phoneKey] || '').toString();
      obj.notes = (r[notesKey] || '').toString();
      return obj;
    }).filter(x => x.firstName || x.phone); // remove empty lines

    // get first 5 agents
    const agents = await Agent.find().limit(5);
    if(agents.length < 1) {
      return res.status(400).json({ message: 'No agents found. Please add agents first.' });
    }
    // distribute equally among agents
    const total = rows.length;
    const perAgent = Math.floor(total / agents.length);
    const remainder = total % agents.length;

    const distributed = [];
    let index = 0;
    for(let i=0;i<agents.length;i++){
      const count = perAgent + (i < remainder ? 1 : 0);
      const items = rows.slice(index, index + count);
      index += count;
      const dl = new DistributedList({ agent: agents[i]._id, items });
      await dl.save();
      distributed.push({ agent: agents[i], items, listId: dl._id });
    }
    // cleanup file
    fs.unlinkSync(req.file.path);
    res.json({ message: 'File processed and distributed', distributed });
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// get distributed lists
router.get('/', auth, async (req,res)=>{
  try{
    const lists = await DistributedList.find().populate('agent').limit(100);
    res.json(lists);
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
