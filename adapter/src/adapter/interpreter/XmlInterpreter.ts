import {Interpreter} from "./Interpreter";
import { InterpreterParameterDescription } from "./InterpreterParameterDescription";
const xml2js = require('xml2js');

export class XmlInterpreter extends Interpreter{

  type: string = "XML"
  description: string = "Interpret data as XML data"
  parameters: InterpreterParameterDescription[] = []

  override getType(): string {
    return this.type
  }

  override getDescription(): string {
    return this.description
  }

  override getAvailableParameters(): InterpreterParameterDescription[] {
    return this.parameters;
  }

  // TODO @Georg check if this package can be used..
  override doInterpret(data: string, parameters: Record<string, unknown>): Promise<string> {
    var parser = new xml2js.Parser({explicitArray: false});
     
    return parser.parseStringPromise(data).then(function (result:any) {
       // `result` is a JavaScript object
      // convert it to a JSON string
      return result.root
      //const json = JSON.stringify(result.root);
      //return json;
    })
    .catch(function (err:any) {
      throw err
    }); 
  }
}
