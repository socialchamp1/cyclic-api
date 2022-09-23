const AWS = require("aws-sdk")
const s3 = new AWS.S3()

const main = async () => {
    try{
        // await s3.putObject({
        //     Body: JSON.stringify({name: 'mike'}),
        //     Bucket: "cyclic-cerise-walrus-hat-ap-southeast-1",
        //     Key: "tes.json",
        // }).promise()

        let my_file = await s3.listObjects({
            Bucket: "cyclic-cerise-walrus-hat-ap-southeast-1",
            // Key: "tes.json",
        }).promise()

        console.log(my_file)
    }
    catch(e) { console.log(e) }
}

main()