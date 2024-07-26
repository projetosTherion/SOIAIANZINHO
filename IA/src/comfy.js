const logger = require('./logger').child({ label: 'comfy.js' });

import fetch from 'cross-fetch';
const fs = require('fs');
const FormData = require('form-data');
import dotenv from "dotenv";
dotenv.config();

const servers = [
    process.env.IP_COMFY1

];

let currentServerIndex = 0;

function getNextServer() {
    const server = servers[currentServerIndex];
    currentServerIndex = (currentServerIndex + 1) % servers.length;
    console.log('aqui é o serv:', server);
    return server;
}

const token = process.env.TOKEN_COMFY;
const authHeader = `Bearer ${token}`;
const headers = {
    'Authorization': authHeader,
    'Content-Type': 'application/json'
};

async function uploadImageOutputConfy(serverAddress, base64Image, tempFileName) {
    try {
        const formData = new FormData();
        const binaryData = Buffer.from(base64Image, 'base64');
        await fs.promises.writeFile(tempFileName, binaryData);
        formData.append('image', fs.createReadStream(tempFileName));

        const options = {
            method: 'POST',
            body: formData,
            headers: { 'Authorization': authHeader },
        };

        const response = await fetch(`http://${serverAddress}/upload/image`, options);
        const data = await response.json();
        fs.unlinkSync(tempFileName);
        return { "erro": 0, "msg": data };
    } catch (error) {
        console.error('Erro:', error);
        fs.unlinkSync(tempFileName);
        return { "erro": 1, "msg": error };
    }
}

async function imageFinishGenerateConfy(serverAddress, prompt_id) {
    try {
        const options = {
            method: 'GET',
            headers: { ...headers }
        };
        const response = await fetch(`http://${serverAddress}/history/${prompt_id}`, options);
        const data = await response.json();

        if (JSON.stringify(data).length === 2) {
            console.log("Ainda nao finalizou imagem");
            await new Promise(resolve => setTimeout(resolve, 8000));
            await imageFinishGenerateConfy(serverAddress, prompt_id);
        } else {
            return { "erro": 0, "msg": "Imagem já gerada" };
        }
    } catch (error) {
        console.error('Erro:', error);
        return { "erro": 1, "msg": error };
    }
}

async function generateImageConfy(serverAddress, prompt) {
    try {
        const data = JSON.stringify({ prompt });
        const options = {
            method: 'POST',
            headers: { ...headers },
            body: data
        };
        
        const response = await fetch(`http://${serverAddress}/prompt`, options);
        const responseData = await response.json();

        if (responseData.prompt_id) {
            await imageFinishGenerateConfy(serverAddress, responseData.prompt_id);
            return { "erro": 0, "msg": responseData };
        } else {
            console.error('Erro:', responseData.node_errors);
            return { "erro": 1, "msg": responseData };
        }
    } catch (error) {
        console.error('Erro:', error);
        return { "erro": 1, "msg": error };
    }
}

async function getImage(serverAddress, user) {
    try {
        let i = 1;
        let base64Data;
        let latestFilename = `${user}_00001_.jpg`;
        const options = { method: 'GET', headers: { 'Authorization': authHeader } };

        async function checkNextImage() {
            const currentFilename = `${user}_${String(i).padStart(5, '0')}_.jpg`;
            const response = await fetch(`http://${serverAddress}/view?filename=${currentFilename}`, options);
            if (response.ok) {
                latestFilename = currentFilename;
                i++;
                await checkNextImage();
            } else {
                const response = await fetch(`http://${serverAddress}/view?filename=${latestFilename}`, options);
                const buffer = await response.buffer();
                base64Data = buffer.toString('base64');
                console.log('Nome do arquivo gerado:', latestFilename);
                return { "erro": 0, "msg": base64Data };
            }
        }

        await checkNextImage();
        return { "erro": 0, "msg": base64Data };
    } catch (error) {
        console.error('Erro:', error);
        return { "erro": 1, "msg": error };
    }
}

const api = {
    async createImage(req, res) {
        try {
            const image = req.body.image;
            const image2 = req.body.image2;
            const imageName = req.body.imageName;
            const imageName2 = req.body.imageName2;
            const prompt = req.body.prompt;
            const user = req.body.user;
            const serverAddress = getNextServer();

            if (image) {
                const responseuploadImageOutputConfy = await uploadImageOutputConfy(serverAddress, image, imageName);
                if (responseuploadImageOutputConfy.erro) {
                    return res.status(500).json({ "info": responseuploadImageOutputConfy.msg });
                }
            }

            if (image2) {
                const responseuploadImageOutputConfy = await uploadImageOutputConfy(serverAddress, image2, imageName2);
                if (responseuploadImageOutputConfy.erro) {
                    return res.status(500).json({ "info": responseuploadImageOutputConfy.msg });
                }
            }

            const responsegenerateImageConfy = await generateImageConfy(serverAddress, prompt);
            if (responsegenerateImageConfy.erro) {
                return res.status(500).json({ "info": responsegenerateImageConfy.msg });
            }

            const responseimageFinishGenerateConfy = await imageFinishGenerateConfy(serverAddress, responsegenerateImageConfy.msg.prompt_id);
            if (responseimageFinishGenerateConfy.erro) {
                return res.status(500).json({ "info": responseimageFinishGenerateConfy.msg });
            }

            const responsegetImage = await getImage(serverAddress, user);
            if (responsegetImage.erro) {
                return res.status(500).json({ "info": responsegetImage.msg });
            }

            return res.status(200).json({ "msg": "geraçao de imagem concluida", "image": responsegetImage.msg });
        } catch (error) {
            return res.status(500).json({ "info": "erro" });
        }
    },
    async health(req, res) {
        res.status(200).json({ "status": "OK" });
    }
};

export default api;