const { spawn } = require('child_process');
const path = require('path'); 

const pythonScriptPath = path.join(__dirname, '../machine-learning/kesehatan.py'); 


function callPythonScript(age, height, weight) {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', [pythonScriptPath, age, height, weight]);

        pythonProcess.on('error', (err) => {
            console.error('Failed to start child process:', err);
            reject(new Error('Failed to start Python script.')); 
        });

        let output = '';
        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error('Error from Python script:', data.toString());
            reject(new Error('Python script encountered an error.')); 
        });

        pythonProcess.on('close', (code) => {
            resolve(output); 
        });
    });
}

function processPythonOutput(output) {
    try {
        if (typeof output !== 'string') {
            throw new Error('Invalid Python output type.');
        }
        const results = JSON.parse(output);
        results.bmi = parseFloat(results.bmi.toFixed(2));
        results.accuracy = parseFloat((results.accuracy * 100).toFixed(2)); 
        return results;
    } catch (error) {
        console.error('Error parsing Python output:', error);
        throw new Error('Failed to parse Python output.'); 
    }
}

exports.processUserData = async (req, res) => {
    try {
        const { age, height, weight } = req.body;

        // Validasi data input 
        if (isNaN(age) || age <= 0 || isNaN(height) || height <= 0 || isNaN(weight) || weight <= 0) {
            return res.status(400).json({ message: 'Invalid input data.' });
        }

        const output = await callPythonScript(age, height, weight); 
        const results = processPythonOutput(output); 
        res.json(results); 

    } catch (error) { 
        console.error('Error during Machine Learning processing:', error);
        return res.status(500).json({ message: error.message }); 
    }
};