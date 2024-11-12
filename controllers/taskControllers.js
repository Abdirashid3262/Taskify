const { IncomingForm } = require('formidable');
const { readTasksFromFile, writeTasksToFile } = require("../utils/fileHandler");
const fs = require('fs');
const path = require('path');

exports.getTasks = (req, res) => {
    const tasks = readTasksFromFile();
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify(tasks));
};

exports.createTask = (req, res) => {
    const form = new IncomingForm();
    form.parse(req, (err, fields, files) => {
        if (err) {
            res.writeHead(400, { 'content-type': 'application/json' });
            res.end(JSON.stringify({ message: 'Error parsing form' }));
            return;
        }

        const image = files.image ? files.image[0] : null;

        const tasks = readTasksFromFile();
        const newTask = {
            id: Date.now(),
            title: fields.title,
            description: fields?.description || '',
            status: fields?.status || 'pending',
            image: image ? `/uploads/${image.newFilename}` : null,
        };
        tasks.push(newTask);

        writeTasksToFile(tasks);

        if (image) {
            fs.copyFileSync(image.filepath, path.join(__dirname, '../uploads', image.newFilename));
        }

        res.writeHead(201, { 'content-type': 'application/json' });
        res.end(JSON.stringify(newTask));
    });
};

exports.updateTask = (req, res) => {
    const form = new IncomingForm();
    form.parse(req, (err, fields, files) => {
        if (err) {
            res.writeHead(400, { 'content-type': 'application/json' });
            res.end(JSON.stringify({ message: 'Error parsing form' }));
            return;
        }

        const taskId = parseInt(fields.id);
        const tasks = readTasksFromFile();
        const taskIndex = tasks.findIndex(task => task.id === taskId);

        if (taskIndex === -1) {
            res.writeHead(404, { 'content-type': 'application/json' });
            res.end(JSON.stringify({ message: 'Task not found' }));
            return;
        }

        // Update task fields
        tasks[taskIndex].title = fields.title || tasks[taskIndex].title;
        tasks[taskIndex].description = fields.description || tasks[taskIndex].description;
        tasks[taskIndex].status = fields.status || tasks[taskIndex].status;

        // Handle file update if a new image is provided
        if (files.image) {
            const image = files.image[0];
            tasks[taskIndex].image = `/uploads/${image.newFilename}`;
            fs.copyFileSync(image.filepath, path.join(__dirname, '../uploads', image.newFilename));
        }

        writeTasksToFile(tasks);
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify(tasks[taskIndex]));
    });
};

exports.deleteTask = (req, res) => {
    const taskId = parseInt(req.url.split("/").pop());
    const tasks = readTasksFromFile();
    const taskIndex = tasks.findIndex(task => task.id === taskId);

    if (taskIndex === -1) {
        res.writeHead(404, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ message: 'Task not found' }));
        return;
    }

    const deletedTask = tasks.splice(taskIndex, 1)[0];
    writeTasksToFile(tasks);

    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ message: 'Task deleted successfully', deletedTask }));
};
