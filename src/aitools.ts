/**
 * Copyright (C) 2023 Lalulla, Inc. All rights reserved.
 * Copyright (c) 2023 - Joel M. Damaso - mailto:jammi_dee@yahoo.com Manila/Philippines
 * This file is part of Lalulla System.
 * 
 * LaKuboTron Framework is distributed under the terms of the GNU General Public License 
 * as published by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * LaKuboTron System is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE.  See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with Lalulla System.  If not, see <http://www.gnu.org/licenses/>.
 * 
 * Framework Designed by: Jammi Dee (jammi_dee@yahoo.com)
 *
 * File Create Date: 04/01/2024 10:09AM
 * Created by: Jammi Dee
 * Modified by: Jammi Dee
 *
*/

const chalk                 = require('chalk');

import { exec }             from 'child_process';
import * as mysql           from 'mysql2/promise';
import { highlight }        from 'cli-highlight';

interface ToolSchema {
    type: string;
    function: {
        name: string;
        description: string;
        parameters: {
            type: string;
            properties: {
                [key: string]: {
                    type: string;
                    description: string;
                }
            };
            required: string[];
        };
    };
}

interface ToolFunction {
    (params: any): Promise<any>;
}

interface Tool {
    schema: ToolSchema;
    function: ToolFunction;
}

const tools: Tool[] = [
    {
        schema: {
            type: 'function',
            function: {
                name: 'cmd',
                description: 'execute an arbitrary CMD command',
                parameters: {
                    type: 'object',
                    properties: {
                        command: {
                            type: 'string',
                            description: 'CMD command to run'
                        }
                    },
                    required: ['command']
                }
            },
        },
        function: async ({ command }: { command: string }) => {
            return new Promise((resolve, reject) => {
                console.log(`Running ${command}`);
                //exec(command, { silent: true }, (code: any, stdout: any, stderr: any) => {
                exec(command, (code: any, stdout: any, stderr: any) => {

                    if (code === 0) {
                        console.log(highlight(stdout, { language: 'bash', ignoreIllegals: true }))
                        resolve(stdout);
                    } else {
                        console.log(stderr);
                        resolve(`${stdout}\n${stderr}`)
                    }
                });
            });
        }
    },
    {
        schema: {
            type: 'function',
            function: {
                name: 'sql',
                description: 'execute an arbitrary sql command',
                parameters: {
                    type: 'object',
                    properties: {
                        sqlscript: {
                            type: 'string',
                            description: 'SQL command to run'
                        }
                    },
                    required: ['sqlscript']
                }
            },
        },
        function: async ({ sqlscript }: { sqlscript: string }) => {
            return new Promise(async (resolve, reject) => {
                console.log(`Running ${sqlscript}`);

                const connection = await mysql.createConnection({
                    host: process.env.DB_HOST,
                    database: process.env.DB_NAME,
                    user: process.env.DB_USER,
                    password: process.env.DB_PASSWORD,
                });

                try {
                    console.log(`Running SQL query: ${sqlscript}`);
                    const [rows, fields] = await connection.execute(sqlscript);
                    const rowsAny: any[] = rows as any[];
                    const result = '\n\n' + generateTextTable( rowsAny );
                    resolve(result);
                } catch (error) {
                    console.error(`Error executing SQL query: ${error.message}`);
                    resolve(`${error.message}\n${error.stack || ''}`);
                } finally {
                    await connection.end();
                }
            });
        }
    }
];

//Added by Jammi Dee 12/15/2023
function generateTextTable( data: any[] ) {
    const columns = Object.keys(data[0]);
    const columnWidths:any = {};
  
    // Find the maximum width for each column
    columns.forEach(column => {
      columnWidths[column] = Math.max(column.length, ...data.map(row => String(row[column]).length));
    });
  
    // Generate the table header
    let table = chalk.blue(`+${columns.map(column => '-'.repeat(columnWidths[column] + 2)).join('+')}+\n`);
    table += chalk.blue(`|${columns.map(column => ` ${column.padEnd(columnWidths[column])} `).join('|')}|\n`);
    table += chalk.blue(`+${columns.map(column => '-'.repeat(columnWidths[column] + 2)).join('+')}+\n`);
  
    // Generate the table rows
    data.forEach(row => {
      table += chalk.blue(`|${columns.map(column => ` ${String(row[column]).padEnd(columnWidths[column])} `).join('|')}|\n`);
    });
  
    table += chalk.blue(`+${columns.map(column => '-'.repeat(columnWidths[column] + 2)).join('+')}+\n`);
  
    return table;
  };

export default tools;
