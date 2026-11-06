import DataURIParser from 'datauri/parser.js'
import path from 'path'

const parser = new DataURIParser()

export const getBuffer = (file: any) => {
  const extName = path.extname(file.originalname).toString()
  return parser.format(extName, file.buffer).content
}