import uuidv4 from 'uuid/v4.js'
import got from 'got'
import fs from 'fs-extra'
import {Invoke_ProcessTemplate} from "@tervis/tervisutilityjs"

export async function Invoke_ProcessTemplateFile ({
    $TemplateFilePath,
    $TemplateVariables
}) {   
    let $TemplateContent = await fs.readFile($TemplateFilePath, "utf-8")
    var $Result = Invoke_ProcessTemplate({ $TemplateContent, $TemplateVariables })
    return $Result
}

export function New_TemporaryDirectory({
    $TemporaryFolderType
}) {
    let $GUID = uuidv4()
    let $TemporaryFolderRoot = (() => {
        if ($TemporaryFolderType === "System") {
            return `C:\\windows\\temp`
        }
    })()

	return `${$TemporaryFolderRoot}\\${$GUID}`
}

export async function Invoke_FileDownload({
    $URI,
    $OutFile
}) {   
    return new Promise((resolve, reject) => {
        const options = {
            url: $URI,
            timeout: 120000,
            stream: true,
        }
        const stream = got(options).pause();
        let fileStream;

        stream.on("error", error => {
            if (fileStream) {
                fileStream.destroy();
            }
            reject(error);
        });
        stream.on("data", data => {
            fileStream.write(data);
        });
        stream.on("end", () => {
            fileStream.end();
        });
        stream.on("response", function () {
            fileStream = fs.createWriteStream($OutFile);
            fileStream.on("error", error => {
                stream.destroy();
                reject(error);
            })
            fileStream.on("close", () => {
                resolve($OutFile);
            });
            this.resume();
        });
    });
}