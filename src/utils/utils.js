import * as fs from "node:fs";
import path from 'node:path';
import { fileURLToPath } from 'node:url';
    
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const readDataJson = (filename) => {
    let pathFile = path.join(__dirname, "..", "data", filename);

    if(!fs.existsSync(pathFile)){
        throw new Error("Error al intentar leer los datos de usuarios, ya que no existe ningun archivo llamado:" + filename);
    }

    let data = fs.readFileSync(pathFile, "utf-8");
    return JSON.parse(data);
};

export const writeDataJson = (filename, data) => {
    let pathFile = path.join(__dirname, "..", "data", filename);

    if(!fs.existsSync(pathFile)){
        throw new Error("Error al intentar guardar los datos de usuarios, ya que no existe ningun archivo llamado:" + filename);
    }

    fs.writeFileSync(pathFile, JSON.stringify(data, null, 4), "utf-8");
    return true;
};