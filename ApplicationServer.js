'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var path$2 = require('path');
var os = require('os');
var fs$2 = require('fs-extra');
var optimist = require('optimist');
var require$$2 = require('child_process');
var url$2 = require('url');
var express = require('express');
var JSON5 = require('json5');
var httpProxy = require('http-proxy');
var querystring$2 = require('querystring');
var fetch = require('node-fetch');
var glob = require('glob');
var tar$1 = require('tar-fs');
var archiver = require('archiver');
var require$$0 = require('fs');
var htmlparser = require('htmlparser2');
var events = require('events');
var decompress = require('decompress');
var stream = require('stream');
var util = require('util');
var require$$3 = require('http');
var require$$5 = require('ncp');
var require$$6$1 = require('serve-static');
var require$$7 = require('node-uuid');
var require$$8 = require('on-finished');
var require$$9 = require('du');
var require$$6 = require('tar-stream');
var open = require('open');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var path__default = /*#__PURE__*/_interopDefaultLegacy(path$2);
var os__default = /*#__PURE__*/_interopDefaultLegacy(os);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs$2);
var optimist__default = /*#__PURE__*/_interopDefaultLegacy(optimist);
var require$$2__default = /*#__PURE__*/_interopDefaultLegacy(require$$2);
var url__default = /*#__PURE__*/_interopDefaultLegacy(url$2);
var express__default = /*#__PURE__*/_interopDefaultLegacy(express);
var JSON5__default = /*#__PURE__*/_interopDefaultLegacy(JSON5);
var httpProxy__default = /*#__PURE__*/_interopDefaultLegacy(httpProxy);
var querystring__default = /*#__PURE__*/_interopDefaultLegacy(querystring$2);
var fetch__default = /*#__PURE__*/_interopDefaultLegacy(fetch);
var glob__default = /*#__PURE__*/_interopDefaultLegacy(glob);
var tar__default = /*#__PURE__*/_interopDefaultLegacy(tar$1);
var archiver__default = /*#__PURE__*/_interopDefaultLegacy(archiver);
var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0);
var htmlparser__default = /*#__PURE__*/_interopDefaultLegacy(htmlparser);
var decompress__default = /*#__PURE__*/_interopDefaultLegacy(decompress);
var require$$3__default = /*#__PURE__*/_interopDefaultLegacy(require$$3);
var require$$5__default = /*#__PURE__*/_interopDefaultLegacy(require$$5);
var require$$6__default$1 = /*#__PURE__*/_interopDefaultLegacy(require$$6$1);
var require$$7__default = /*#__PURE__*/_interopDefaultLegacy(require$$7);
var require$$8__default = /*#__PURE__*/_interopDefaultLegacy(require$$8);
var require$$9__default = /*#__PURE__*/_interopDefaultLegacy(require$$9);
var require$$6__default = /*#__PURE__*/_interopDefaultLegacy(require$$6);
var open__default = /*#__PURE__*/_interopDefaultLegacy(open);

// Store variable Om = 10 in localStorage

/**
 *  Copyright (c) 2019, 2024 Texas Instruments Incorporated
 *  All rights reserved.
 *
 *   Redistribution and use in source and binary forms, with or without
 *   modification, are permitted provided that the following conditions
 *   are met:
 *
 *      Redistributions of source code must retain the above copyright
 *  notice, this list of conditions and the following disclaimer.
 *  notice, this list of conditions and the following disclaimer in the
 *  documentation and/or other materials provided with the distribution.
 *      Neither the name of Texas Instruments Incorporated nor the names of
 *  its contributors may be used to endorse or promote products derived
 *  from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 *  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 *  THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 *  PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 *  CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 *  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 *  OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
 *  OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 *  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 *  Original Author:
 *      Patrick Chuong, Texas Instruments, Inc.
 */
const PARAM_PORT = 'port';
const PARAM_ALLOWED_IP = 'allowedIP';
const PARAM_TRACE_ROUTE = 'traceroute';
const PARAM_BROWSER = 'browser';
const BROWSER = optimist__default["default"].argv[PARAM_BROWSER] ?? '';
const localhost = '127.0.0.1';
const isNW = BROWSER.indexOf('nw') > 0;
/**
 * Get the app profile path
 */
const getProfilePath = (app) => {
    const getWin = () => path__default["default"].join(os.homedir(), 'AppData', 'Local');
    const getLinux = () => path__default["default"].join(os.homedir(), '.config');
    const getOSX = () => path__default["default"].join(os.homedir(), 'Library', 'Application Support');
    const getDefault = () => os.platform().startsWith('win') ? getWin() : getLinux();
    let appDataPath = process.env['APPDATA'];
    if (!appDataPath) {
        switch (os.platform()) {
            case 'win32':
                appDataPath = getWin();
                break;
            case 'linux':
                appDataPath = getLinux();
                break;
            case 'darwin':
                appDataPath = getOSX();
                break;
            default:
                appDataPath = getDefault();
                break;
        }
    }
    return path__default["default"].join(appDataPath, app);
};
/**
 * Helper for converting command line arguments to absolute path, including support for home tilda (~) prefix.
 * The tilda (~) is not part of the OS, and is a feature of command shell(s) only, so it has to be
 * removed from the path.  Path.resolve() or path.join() does not handle this.
 */
function convertToAbsolutePath(relPath, absRoot) {
    // convert ~ to homedir
    relPath = relPath.replace(/^~($|\/|\\)/, `${os.homedir()}$1`);
    if (!path__default["default"].isAbsolute(relPath)) {
        relPath = path__default["default"].join(absRoot, relPath);
    }
    return relPath;
}
const logLevel = +(optimist__default["default"].argv['enableLog'] ?? '4');
/**
 * Console Logger class.
 */
class ConsoleLogger {
    fatal(input) {
        console.error(input);
    }
    critical(input) {
        if (logLevel >= 0) {
            console.error(input);
        }
    }
    debug(input) {
        if (logLevel >= 4) {
            console.debug(input);
        }
    }
    log(input) {
        if (logLevel >= 3) {
            console.log(input);
        }
    }
}
const consoleLogger = new ConsoleLogger();
/**
 * Abstract server for the GUI Composer server.
 */
class AbstractServer {
    constructor(allowedIP) {
        this.app = express__default["default"]();
        this.app.use(express__default["default"].json());  // Add middleware to parse JSON bodies
        this.port = optimist__default["default"].argv[PARAM_PORT] || 0;
        this.allowedIP = optimist__default["default"].argv[PARAM_ALLOWED_IP] || allowedIP || '0.0.0.0';
        /* trace routes */
        if (optimist__default["default"].argv[PARAM_TRACE_ROUTE]) {
            this.app.all('**', (req, res, next) => {
                console.log(req.url);
                next();
            });
        }
    }
    /**
     * Called with server is listening to incoming request.
     */
    onListening(port) { }
    /**
     * Concrete class can override this method and provide additional static route.
     * @param app express app
     */
    initializeStaticRoute(app) { }
    /**
     * Returns teh logger object that will be use to log error, warning, trace, etc...
     */
    get logger() {
        return consoleLogger;
    }
    /**
     * Run the GUI Composer server.
     */
    async listen() {
        // start listening to requests
        console.log("this is editable");
        await new Promise((resolve) => {
            console.log('Starting GUI Composer Server ...');
            const server = this.app.listen(this.port || 0, this.allowedIP, () => {
            const address = server.address();
            this.server = server;
            if (this.instanceOfAddress(address)) {
                this.port = address.port;
                console.log(`... server started at port: ${this.port}`);
                resolve();
            }
            else {
                console.error(`... failed to start server at port: ${this.port}`);
                process.exit(1);
            }
            });
        });
        const tidePath = path__default["default"].join(__dirname, 'tide.json');

// 1. Create a new tide
this.app.post('/api/createTide', (req, res) => {
    try {
        const { name, range, offset } = req.body;

        if (!name || typeof range !== 'number' || typeof offset !== 'number') {
            return res.status(400).json({ success: false, message: 'Invalid tide data' });
        }

        const tidesData = fs__default["default"].existsSync(tidePath)
            ? JSON5__default["default"].parse(fs__default["default"].readFileSync(tidePath, 'utf8'))
            : [];

        // Check for duplicate tide name
        if (tidesData.some(tide => tide.name === name)) {
            return res.status(409).json({ success: false, message: 'Tide with this name already exists' });
        }

        tidesData.push({ name, range, offset });
        fs__default["default"].writeFileSync(tidePath, JSON.stringify(tidesData, null, 2), 'utf8');

        res.status(201).json({ success: true, message: 'Tide created successfully' });
    } catch (error) {
        console.error('Error creating tide:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// 2. Get all tides
this.app.get('/api/getAllTides', (req, res) => {
    try {
        const tidesData = fs__default["default"].existsSync(tidePath)
            ? JSON5__default["default"].parse(fs__default["default"].readFileSync(tidePath, 'utf8'))
            : [];

        res.status(200).json({ success: true, tides: tidesData });
    } catch (error) {
        console.error('Error reading tides:', error);
        res.status(500).json({ success: false, message: 'Failed to read tide data' });
    }
});

// 3. Modify a tide
this.app.post('/api/modifyTide', (req, res) => {
    try {
        const { name, newRange, newOffset } = req.body;

        if (!name || typeof newRange !== 'number' || typeof newOffset !== 'number') {
            return res.status(400).json({ success: false, message: 'Invalid input' });
        }

        const tidesData = fs__default["default"].existsSync(tidePath)
            ? JSON5__default["default"].parse(fs__default["default"].readFileSync(tidePath, 'utf8'))
            : [];

        const index = tidesData.findIndex(tide => tide.name === name);

        if (index === -1) {
            return res.status(404).json({ success: false, message: 'Tide not found' });
        }

        tidesData[index].range = newRange;
        tidesData[index].offset = newOffset;

        fs__default["default"].writeFileSync(tidePath, JSON.stringify(tidesData, null, 2), 'utf8');

        res.status(200).json({ success: true, message: 'Tide updated successfully' });
    } catch (error) {
        console.error('Error modifying tide:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
this.app.post('/api/deleteTide', (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Tide name is required' });
        }

        const tidesData = fs__default["default"].existsSync(tidePath)
            ? JSON5__default["default"].parse(fs__default["default"].readFileSync(tidePath, 'utf8'))
            : [];

        const updatedTides = tidesData.filter(tide => tide.name !== name);

        if (updatedTides.length === tidesData.length) {
            return res.status(404).json({ success: false, message: 'Tide not found' });
        }

        fs__default["default"].writeFileSync(tidePath, JSON.stringify(updatedTides, null, 2), 'utf8');

        res.status(200).json({ success: true, message: 'Tide deleted successfully' });
    } catch (error) {
        console.error('Error deleting tide:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

        this.app.get('/api/check', (req, res) => {
            res.send("this is working");
        });
        this.app.post('/api/changeUser', (req, res) => {
            try {
                const { userType, newUserName, currentPassword, newPassword } = req.body;
                const usersPath = path__default["default"].join(__dirname, 'users.json');
                
                // Read the users.json file
                const usersData = JSON5__default["default"].parse(fs__default["default"].readFileSync(usersPath, 'utf8'));
                
                // Verify the current password
                if (!usersData[userType] || usersData[userType].password !== currentPassword) {
                    return res.status(401).json({ success: false, message: 'Current password is incorrect' });
                }
                
                // Update username if provided
                if (newUserName && newUserName !== usersData[userType].username) {
                    usersData[userType].username = newUserName;
                }
                
                // Update password if provided
                if (newPassword && newPassword.length >= 3) {
                    usersData[userType].password = newPassword;
                } else if (newPassword) {
                    return res.status(400).json({ success: false, message: 'Password must be at least 3 characters' });
                }
                
                // Save the updated user data
                fs__default["default"].writeFileSync(usersPath, JSON.stringify(usersData, null, 2), 'utf8');
                
                res.status(200).json({ success: true, message: 'Credentials updated successfully' });
            } catch (error) {
                console.error('Error updating user:', error);
                res.status(500).json({ success: false, message: 'Error updating user information' });
            }
        });
        try {
            // initialize the services
            const controller = await this.initializeServices();
            // create the static file path map
            if (controller) {
                this.app.use('/', controller.router);
                this.initializeStaticRoute(this.app);
                // exit the process if there is no controller to handle the requests
            }
            else {
                this.logger.critical('Missing controller to handle dynamic routes.');
                process.exit(1);
            }
            this.onListening(this.port);
        }
        catch (e) {
            this.logger.fatal(e);
            process.exit(1);
        }
        return this.port;
    }
    instanceOfAddress(arg) {
        return !!arg.port;
    }
}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function getDefaultExportFromNamespaceIfPresent (n) {
	return n && Object.prototype.hasOwnProperty.call(n, 'default') ? n['default'] : n;
}

function getDefaultExportFromNamespaceIfNotNamed (n) {
	return n && Object.prototype.hasOwnProperty.call(n, 'default') && Object.keys(n).length === 1 ? n['default'] : n;
}

function getAugmentedNamespace(n) {
  if (n.__esModule) return n;
  var f = n.default;
	if (typeof f == "function") {
		var a = function a () {
			if (this instanceof a) {
        return Reflect.construct(f, arguments, this.constructor);
			}
			return f.apply(this, arguments);
		};
		a.prototype = f.prototype;
  } else a = {};
  Object.defineProperty(a, '__esModule', {value: true});
	Object.keys(n).forEach(function (k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function () {
				return n[k];
			}
		});
	});
	return a;
}

var fileutils$3 = {};

/**
 * @copyright 2014, Texas Instruments
 * @owner dalexiev
 * 
 * /util/fileutils.js
 */

(function (exports) {
	var fs = require$$0__default["default"];
	var path  = path__default["default"];
	var child_process = require$$2__default["default"]; 
	var isWin = /^win/.test(process.platform);

	var mkdirSync = function (path) {
		try {
			fs.mkdirSync(path);
		} catch(e) {
			if (!(e.code == 'EEXIST' || e.code == 'EISDIR')) throw e;
		}
	};

	/**
	 * Ensure a folder exists. 
	 * If works for both relative and absolute dirpath.
	 */
	exports.mkdirSync = function ( dirpath) {
		var driveLetter = "";
		var myPath = dirpath;
		if (isWin) {
			var index = myPath.indexOf(":");
			if (index > 0) {
				driveLetter = myPath.substring(0, index+2);
				myPath = myPath.substring(index+2);
			}
		}
		
		var parts = myPath.split(path.sep);
		for( var i = 1; i <= parts.length; i++ ) {
			var currentPath = path.join.apply(null, parts.slice(0, i));
			if( dirpath.indexOf(path.sep) == 0) {
				if( i == 1) {
					currentPath = path.sep;
				}
				else {
					currentPath = path.sep + currentPath;
				}
			}
			mkdirSync( driveLetter + currentPath);
		}
	};

	/**
	 * Remove files and directories for the given path.
	 * 
	 * @param dirpath the directory path
	 */
	exports.rmdirSync = function rmdirSync(dirpath) {
		var files = [];
		if (fs.existsSync(dirpath)) {
			files = fs.readdirSync(dirpath);
			files.forEach(function(file, index){
				var curPath = dirpath + "/" + file;
				if (fs.lstatSync(curPath).isDirectory()) { // recurse
					rmdirSync(curPath);
				} else { // delete file
					fs.unlinkSync(curPath);
				}
			});
			
			/* WORKAROUND: sometime rmdirSync failed due to unlinySync didn't finish removing the files from disk */
			var retry = true;
			for (var i = 0; retry && (i < 20); ++i) {
				try {
					fs.rmdirSync(dirpath);
					retry = false;
				} catch (e) {
					retry = true;
				}
			}
	    }
	};


	/**
	 * Returns random generated file name that does not exist in the specified folder. 
	 * @param folder 
	 * @param callback( error, filePath) - the full path of the file.  
	 */
	exports.getTempFile = function getTempFileName( folder, callback) {
		var _getFileName = function( level) {
			if( level >= 20) {
				callback(new Error("Cannot create temp file."));
				return;
			};
			var dest = Math.floor((Math.random() * 10E8) + 1);
			var name = dest.toString() + ".tmp";
			var fullPath = path.join(folder, name);
			fs.exists( fullPath, function (exists) {
				if( exists) {
					_getFileName( level + 1);
					return;
				}
			    callback( undefined, fullPath);
			});
		};
		_getFileName(0);
	};


	// assumes folder is a folder.
	// callback( error, files, folders)
	function listFilesAndFolders( folder, callback) {
		fs.readdir( folder, function( error, items) {
			var files = [];
			var folders = [];
			if( error ) {
				return callback(error , files, folders);
			};
			var count = items.length;
			if( count == 0) {
				return callback(undefined, files, folders); 
			};
			var firstError;
			var current = 0;
			var stat = function( fullpath) {
				fs.stat( fullpath, function( error2, st) {
					if( error2 && !firstError) {
						firstError = error2;
					}
					else if( error2) {
						// DO NOTHING. We recorded the first error.
					}
					else if( st.isFile()) {
						files.push(fullpath);
					}
					else if( st.isDirectory()) {
						folders.push(fullpath);
					};
					++current;
					if( current == count) {
						callback( firstError, files, folders);
					};
				});		
			};
			for(var i = 0; i < count; ++i) {
				stat( path.join( folder, items[i]));
			};
		});	
	};
	exports.listFilesAndFolders = listFilesAndFolders; 

	// assumes files is array of full path names to files. 
	function deleteAllFiles( files, callback) {
		var count = files.length;
		if( count == 0) {
			return callback();
		};
		var firstError;
		var current = 0;
		for( var i = 0; i < count; ++i) {
			fs.unlink( files[i], function( error) {
				if( error && !firstError) {
					firstError = error;
				};
				++current;
				if( current == count) {
					callback( firstError);
				};
			});
		};
	};

	//assumes folders is array of full path names to existing folders. 
	function deleteAllFolders( folders, callback) {
		var count = folders.length;
		if( count == 0) {
			return callback();
		};
		var firstError;
		var current = 0;
		var emptyAndRemoveFolder = function( fullpath) {
			emptyFolder( fullpath, function( error) {
				if( error) {
					// https://github.com/nodejs/node-v0.x-archive/issues/2387
					if( error && error.code == "ENOENT" && error.path && !isWin) {
						child_process.exec("rm -rf " + fullpath, function( err) {
							++current;
							if( current == count) {
								callback( firstError);
							};
						});
						return;
					};
					if( !firstError) {
						firstError = error;
					};
					++current;
					if( current == count) {
						callback( firstError);
					};
					return;
				};
				fs.rmdir(fullpath, function( error2){
					if( error2 && !firstError) {
						firstError = error2; 
					}
					++current;
					if( current == count) {
						callback( firstError);
					};
				});
			});
		};
		
		for( var i = 0; i < count; ++i) {
			emptyAndRemoveFolder( folders[i]);
		};
	}


	// assumes we have write permission for each element.
	// assumes folder is folder and it exists. 
	function emptyFolder( folder, callback) {
		listFilesAndFolders( folder, function( error, files, folders) {
			if( error) {
				return callback( error);
			};
			deleteAllFiles( files, function( error2) {
				if( error2) {
					return callback( error2);
				};
				deleteAllFolders( folders, callback);
			});
		});
	};

	/**
	 * If fullpath does not exist, it creates it. 
	 * If fullpath is a folder, it empties it.
	 * If fullpath is a file, deletes is and creates a folder with the same name instead. 
	 */
	exports.emptyDirectory = function(fullpath, callback){
		fs.exists( fullpath, function(exists){
			if( !exists) {
				exports.mkdirSync( fullpath);
				return callback();
			}
			fs.stat( fullpath, function(error, st) {
				if( error) {
					return callback( error);
				};
				if( st.isFile()) {
					deleteAllFiles( [fullpath], function(error2) {
						exports.emptyDirectory( fullpath, callback);
					});
				}
				else if( st.isDirectory()) {
					emptyFolder( fullpath, function(error){
						if( error && error.code == "ENOENT" && error.path  && !isWin) {
							// https://github.com/nodejs/node-v0.x-archive/issues/2387
							child_process.exec("rm -rf " + fullpath, function( err) {
								callback();
							});
							return;
						};
						callback(error);		
					});
				}
				else {
					callback(new Error("Unsupported File Type: path="+fullpath));
				};
			});
		});
	};

	/**
	 * If fullpath does not exist, it does nothing. 
	 * If fullpath is a folder or a file, it removes it.
	 */
	exports.removeItem = function( fullpath, callback) {
		fs.exists( fullpath, function(exists){
			if( !exists) {
				return callback();
			}
			fs.stat( fullpath, function(error, st) {
				if( error) {
					return callback( error);
				};
				if( st.isFile()) {
					return deleteAllFiles( [fullpath], callback);
				}
				else if( st.isDirectory()) {
					exports.emptyDirectory( fullpath, function( error) {
						if( error) {
							return callback(error);
						};
						return deleteAllFolders( [fullpath], callback); 
					});		
				}
				else {
					callback(new Error("Unsupported File Type: path="+fullpath));
				};
			});
		});
	};

	exports.moveItem = function(oldPath, newPath, callback) {
	    fs.rename(oldPath, newPath, function (err) {
	        if (err) {
	            if (err.code === 'EXDEV') {
	                copy();
	            } else {
	                callback(err);
	            }
	            return;
	        }
	        callback();
	    });

	    function copy () {
	        var readStream = fs.createReadStream(oldPath);
	        var writeStream = fs.createWriteStream(newPath);

	        readStream.on('error', callback);
	        writeStream.on('error', callback);
	        readStream.on('close', function () {
	            fs.unlink(oldPath, callback);
	        });

	        readStream.pipe(writeStream);
	    }
	};

	// https://github.com/nodejs/node-v0.x-archive/issues/2387
	exports.covertFileNamesToUTF8 = function ( folder, callback) {
		if( isWin) {
			callback();
			return;
		};
		listFilesAndFolders( folder, function( error) {
			if( error && error.code == "ENOENT" && error.path) {
				child_process.exec("convmv --notest -r -f iso-8859-1 -t UTF-8 " + folder, function( err) {
					callback({ converted : true});
				});
				return;
			};
			callback();
		});	
	};

	exports.filenameWithDate = function(filename) {
		function _pad(num, size) {
			var s = num + '';
			while (s.length < size) s = '0' + s;
			return s;
		}
		
		var date = new Date();
		return filename + "_"
			+ _pad(date.getUTCFullYear(), 4).toString() 
			+ _pad(date.getUTCMonth()+1, 2).toString() // month in JS is zero base
			+ _pad(date.getUTCDate(), 2).toString()
			+ _pad(date.getUTCHours(), 2).toString()
			+ _pad(date.getUTCMinutes(), 2).toString()
			+ _pad(date.getUTCSeconds(), 2).toString(); 
	};

	exports.encodePathSegments = function(path) {
		var result = [];
		var segments = path.split("/");
		segments.forEach(function(segment) {
			result.push(encodeURIComponent(segment));
		});
		return result.join("/");
	}; 
} (fileutils$3));

var fileutils$2 = /*@__PURE__*/getDefaultExportFromCjs(fileutils$3);

/**
 *  Copyright (c) 2019, 2020, Texas Instruments Incorporated
 *  All rights reserved.
 *
 *   Redistribution and use in source and binary forms, with or without
 *   modification, are permitted provided that the following conditions
 *   are met:
 *
 *      Redistributions of source code must retain the above copyright
 *  notice, this list of conditions and the following disclaimer.
 *  notice, this list of conditions and the following disclaimer in the
 *  documentation and/or other materials provided with the distribution.
 *      Neither the name of Texas Instruments Incorporated nor the names of
 *  its contributors may be used to endorse or promote products derived
 *  from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 'AS IS'
 *  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 *  THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 *  PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 *  CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 *  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 *  OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
 *  OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 *  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 *  Original Author:
 *      Patrick Chuong, Texas Instruments, Inc.
 */
const debug = !!process.env.DEBUG_ComponentsCalculator && process.env.DEBUG_ComponentsCalculator.toLowerCase() === 'true';
const debugTextChecked = (message, force) => {
    if (debug || force) {
        console.log(message);
    }
};
const debugText = (message, tabs) => {
    if (debug) {
        let tabStr = '';
        for (let i = 0; i < tabs; ++i) {
            tabStr += '  ';
        }
        debugTextChecked(tabStr + message);
    }
};
const pad = (width, message, padding) => {
    return (width <= message.length) ? message : pad(width, message + ' ', padding);
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mergeObjects = (obj1, obj2) => {
    for (const attr in obj2) {
        if (obj2.hasOwnProperty(attr)) {
            obj1[attr] = obj2[attr];
        }
    }
    return obj1;
};
const addToArray = (array, item) => {
    if (array.indexOf(item) === -1) {
        array.push(item);
    }
    return array;
};
const parseComponentName = (dotHtml) => {
    const index = dotHtml.indexOf('components');
    if (index !== -1) {
        const tmp = dotHtml.substring(index + 11);
        return tmp.split(/\/|\\/g)[0];
    }
    else {
        return '';
    }
};
const hasCycle = (dotHtml, parent) => {
    if (parent === null) {
        return false;
    }
    else if (parent.path === dotHtml) {
        return true;
    }
    if (parent.parent) {
        return hasCycle(dotHtml, parent.parent);
    }
    else {
        return false;
    }
};
const getParentsPathDebugText = (obj, tabs) => {
    let tabStr = '';
    for (let i = 0; i < tabs; ++i) {
        tabStr += '  ';
    }
    const path = tabStr + obj.path;
    while (obj.parent) {
        return path + '\n' + getParentsPathDebugText(obj.parent, tabs);
    }
    return path;
};
const getDirectDependency = (componentsDir, dotHtml, tabs, cache) => {
    let depends = {};
    try {
        if (cache[dotHtml]) {
            debugText('getDirectDependency <<Cache hit>>', tabs);
            return cache[dotHtml];
        }
        debugText('getDirectDependency <<Cache missed>>: reading file', tabs);
        const content = fs__default["default"].readFileSync(dotHtml, 'utf-8');
        const parser = new htmlparser__default["default"].Parser({
            onopentag: (name, attributes) => {
                if ((name === 'link' && attributes['rel'] === 'import') || (name === 'div' && attributes['class'] === 'lazyImport')) {
                    const href = attributes['href'];
                    /* construct the full path */
                    let baseDir = '';
                    const seg = path__default["default"].normalize(href).split(/\/|\\/g)[0];
                    switch (seg) {
                        case 'components':
                            baseDir = path__default["default"].dirname(componentsDir);
                            break;
                        case 'app':
                            return;
                        default:
                            baseDir = path__default["default"].dirname(dotHtml);
                            break;
                    }
                    const depComponentDotHtml = path__default["default"].join(baseDir, href);
                    /* get the component name from the full path */
                    const depComponentName = parseComponentName(depComponentDotHtml);
                    const depComponentDir = path__default["default"].join(componentsDir, depComponentName);
                    depends[depComponentDotHtml] = { dir: depComponentDir };
                }
            },
            onend: () => {
            },
            onerror: (err) => {
                throw err;
            },
            onparserinit: () => {
            },
            onreset: () => {
            },
            onclosetag: () => {
            },
            ontext: () => {
            },
            oncomment: () => {
            },
            oncdatastart: () => {
            },
            oncommentend: () => {
            },
            onprocessinginstruction: () => {
            }
        }, { decodeEntities: true });
        parser.write(content);
        parser.end();
    }
    catch (e) {
        depends = {};
    }
    /* if it is an internal component, add it to the cache */
    const component = parseComponentName(dotHtml);
    if (component) {
        cache[dotHtml] = depends;
    }
    return depends;
};
const walkAllDependencies = (componentsDir, dotHtml, parent, tabs, cache) => {
    const componentName = parseComponentName(dotHtml);
    debugText('walkAllDependencies start <' + componentName + '>: ' + dotHtml, tabs);
    let depends = getDirectDependency(componentsDir, dotHtml, tabs + 1, cache);
    for (const e in depends) {
        if (depends.hasOwnProperty(e)) {
            debugText('depend: ' + e, tabs + 1);
            /* check for cycle before walking any further */
            if (!hasCycle(e, parent)) {
                depends = mergeObjects(depends, walkAllDependencies(componentsDir, e, {
                    parent: parent,
                    path: e
                }, tabs + 2, cache));
            }
            else {
                debugText('cycle dependency detected: >>>', tabs + 2);
                debugText(getParentsPathDebugText(parent, tabs + 2), tabs + 2);
            }
        }
    }
    debugText('walkAllDependencies end <' + componentName + '>: ' + dotHtml, tabs);
    return depends;
};
const getDependencies = (indexDotHtml) => {
    const t0 = new Date().getTime();
    return new Promise(function (resolve, reject) {
        try {
            const componentsDir = path__default["default"].join(__dirname, '../../designer/v2', 'components');
            const allComponents = walkAllDependencies(componentsDir, indexDotHtml, null, 0, {});
            let depends = new Array();
            /* add default components */
            depends.push(path__default["default"].join(componentsDir, 'ti-core-assets'));
            depends.push(path__default["default"].join(componentsDir, 'webcomponentsjs'));
            depends.push(path__default["default"].join(componentsDir, 'web-animations-js'));
            /* merge dependent components with the default components */
            for (const component in allComponents) {
                if (allComponents.hasOwnProperty(component)) {
                    depends = addToArray(depends, allComponents[component].dir);
                }
            }
            const t1 = new Date().getTime();
            debugTextChecked('Dependency calculated in: ' + (t1 - t0) / 1000 + 's - ' + indexDotHtml, true);
            resolve(depends);
        }
        catch (e) {
            resolve(new Array());
        }
    });
};

/**
 *  Copyright (c) 2019, 2024 Texas Instruments Incorporated
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions
 *  are met:
 *
 *  *   Redistributions of source code must retain the above copyright
 *  notice, this list of conditions and the following disclaimer.
 *  notice, this list of conditions and the following disclaimer in the
 *  documentation and/or other materials provided with the distribution.
 *  *   Neither the name of Texas Instruments Incorporated nor the names of
 *  its contributors may be used to endorse or promote products derived
 *  from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 'AS IS'
 *  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 *  THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 *  PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 *  CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 *  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 *  OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
 *  OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 *  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
class NullStream extends stream.Writable {
    constructor(opts = {}) {
        super({ ...opts, objectMode: true });
    }
    write(chunk, encoding, cb) {
        let done = cb;
        if (!done && typeof encoding === 'function') {
            done = encoding;
        }
        done?.(undefined);
        return true;
    }
}
class Unpacker extends events.EventEmitter {
    constructor() {
        super();
        this.totalEntires = 0;
        this.numFiles = 0;
        this.numDirs = 0;
    }
    static drain(entry, callback) {
        const nullStream = new NullStream();
        nullStream.on('error', function (err) {
            if (callback)
                callback(err);
        });
        nullStream.on('finish', function () {
            if (callback)
                callback(undefined);
        });
        entry.pipe(nullStream);
    }
    async walk(dir) {
        let results = [];
        if (!fs__default["default"].existsSync(dir)) {
            throw Error('No directory found: ' + dir);
        }
        const list = await fs__default["default"].readdir(dir);
        for (let i = 0; i < list.length; i++) {
            const file = `${dir}/${list[i]}`;
            const stat = await fs__default["default"].stat(file);
            if (stat && stat.isDirectory()) {
                results.push({ path: file, type: 'Directory' });
                results = results.concat(await this.walk(file));
            }
            else {
                results.push({ path: file, type: 'File' });
            }
        }
        return results;
    }
    emitEntires(tmpDir, files, counter) {
        if (counter >= files.length) {
            this.emit('close');
            return;
        }
        const file = files[counter];
        const zipPath = file.path.slice(tmpDir.length + 1);
        if (file.type === 'Directory') {
            const obj = {
                type: 'Directory',
                path: file.path,
                zipPath: zipPath
            };
            this.numDirs++;
            this.emit('entry', obj);
            this.emitEntires(tmpDir, files, counter + 1);
        }
        else {
            const rs = fs__default["default"].createReadStream(file.path);
            // attach additional information to the read stream
            rs.type = 'File';
            rs.zipPath = zipPath;
            this.numFiles++;
            rs.on('close', () => {
                this.emitEntires(tmpDir, files, counter + 1);
            }).on('error', (err) => {
                this.emit('error', err);
            });
            this.emit('entry', rs);
        }
    }
    ;
    static unpack(input, tmpDir) {
        const instance = new Unpacker();
        (async function () {
            tmpDir = await fs__default["default"].mkdtemp(tmpDir);
            try {
                /* pipe the request to the file stream */
                const tmpFile = path__default["default"].join(tmpDir, 'import_project.zip');
                await (new Promise((resolve, reject) => {
                    fileutils$2.mkdirSync(tmpDir);
                    const wstream = fs__default["default"].createWriteStream(tmpFile);
                    wstream.on('error', function (err) {
                        reject(err.toString());
                    });
                    wstream.on('close', function () {
                        resolve(tmpFile);
                    });
                    input.pipe(wstream);
                }));
                /* call the decompress to extract the file from the temporary zip file */
                const unzipperDir = path__default["default"].join(tmpDir, '.unzipper');
                const filesResult = await decompress__default["default"](tmpFile, unzipperDir);
                // Workaround: for some reason, when the pip closed the directory is not yet created
                await new Promise(resolve => setTimeout(resolve, 500));
                const list = await fs__default["default"].readdir(unzipperDir);
                /* correct project name containing space */
                await Promise.all(list.map(file => {
                    if (file.indexOf(' ') !== -1) {
                        return new Promise(resolve => fileutils$2.moveItem(path__default["default"].join(unzipperDir, file), path__default["default"].join(unzipperDir, file.replace(/\s/g, '_')), resolve));
                    }
                    return Promise.resolve();
                }));
                /* now walk the directory */
                const files = await instance.walk(unzipperDir);
                /* validate the project before continue */
                if (instance.onValidate && files.length > 0) {
                    const dir = files[0].path.replace(unzipperDir, '').split('/')[1];
                    await instance.onValidate(path__default["default"].join(unzipperDir, dir));
                }
                /* emit the entires */
                instance.totalEntires = files.length;
                instance.emitEntires(unzipperDir, files, 0);
                instance.on('close', function () {
                    fileutils$2.removeItem(tmpDir, () => { });
                });
            }
            catch (err) {
                fileutils$2.removeItem(tmpDir, () => instance.emit('error', err));
            }
        })();
        return instance;
    }
    static async extract(input, tmpDir, unzipperDir) {
        /* pipe the request to the file stream */
        const tmpFile = path__default["default"].join(tmpDir, 'import_project.zip');
        await (new Promise((resolve, reject) => {
            const wstream = fs__default["default"].createWriteStream(tmpFile);
            wstream.on('error', function (err) {
                reject(err.toString());
            });
            wstream.on('close', function () {
                resolve(tmpFile);
            });
            input.pipe(wstream);
        }));
        /* call the decompress to extract the file from the temporary zip file */
        await decompress__default["default"](tmpFile, unzipperDir);
        // Workaround: for some reason, when the pip closed the directory is not yet created
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}
;

/**
 *  Copyright (c) 2019, 2024 Texas Instruments Incorporated
 *  All rights reserved.
 *
 *   Redistribution and use in source and binary forms, with or without
 *   modification, are permitted provided that the following conditions
 *   are met:
 *
 *      Redistributions of source code must retain the above copyright
 *  notice, this list of conditions and the following disclaimer.
 *  notice, this list of conditions and the following disclaimer in the
 *  documentation and/or other materials provided with the distribution.
 *      Neither the name of Texas Instruments Incorporated nor the names of
 *  its contributors may be used to endorse or promote products derived
 *  from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 *  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 *  THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 *  PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 *  CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 *  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 *  OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
 *  OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 *  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 *  Original Author:
 *      Patrick Chuong, Texas Instruments, Inc.
 */
class RespondHandled {
}
;
const componentFilesToIgnore = {
    ignore: (name, header) => {
        return name.indexOf('.git') !== -1
            || name.indexOf('node_modules') !== -1
            || name.indexOf('.project') !== -1
            // || name.indexOf('bower.json') !== -1 /* help about dialog reads the polymer/bower.json file for version info */
            || name.indexOf('package.json') !== -1
            || name.indexOf('.bat') !== -1
            || /.*(\/|\\)(demo|docs|test).*/.test(name);
    }
};
const appFilesToIgnore = {
    ignore: (name, header) => {
        return name.indexOf('.history') !== -1
            || name.indexOf('.recover') !== -1
            || name.indexOf('.git') !== -1
            || name.indexOf('package.json') !== -1
            || name.indexOf('node_modules') !== -1
            || name.indexOf('workspace') !== -1; // Do not export the workspace folder created by the project build component.
    }
};
/**
 * A RESTful resource command handler class.
 */
class ResourceHandler {
    constructor(controller, provider, tmpDir, logger) {
        this.controller = controller;
        this.serviceProvider = provider;
        this.tmpDir = tmpDir;
        this.logger = logger;
    }
    _debug(params) {
        this.logger.debug(`{uid: ${params.uid}, pathname: ${params.pathname}, arguments: ${JSON.stringify(params.args)}}`);
    }
    _getFilenameWithDate(filename) {
        const _pad = (num, size) => {
            let s = num + '';
            while (s.length < size)
                s = '0' + s;
            return s;
        };
        const date = new Date();
        return filename + '_'
            + _pad(date.getUTCFullYear(), 4).toString()
            + _pad(date.getUTCMonth() + 1, 2).toString() // month in JS is zero base
            + _pad(date.getUTCDate(), 2).toString()
            + _pad(date.getUTCHours(), 2).toString()
            + _pad(date.getUTCMinutes(), 2).toString()
            + _pad(date.getUTCSeconds(), 2).toString();
    }
    _setZipResponseHeader(res, filename, type) {
        res.writeHead(200, {
            'Content-Type': 'application/' + type,
            'Content-disposition': 'attachment; filename=' + filename
        });
    }
    async _getHtmlFilePaths(dir) {
        const files = await fs__default["default"].readdir(dir);
        return files.filter(file => {
            const _file = file.toLowerCase();
            return _file.endsWith('.html') && !_file.endsWith('metadata.html');
        }).map(file => {
            return path__default["default"].join(dir, file);
        });
    }
    /**
     * When making change to this function, update the equivalent function in the ti-guicomposer-app-behavior.html file.
     */
    getComponentLibVersion(projVersion) {
        const ver = +((projVersion || '1').split('.')[0]);
        return ver < 3 ? 2 : ver;
    }
    getComponentLibVerDetail(version) {
        const [major, minor, rev] = version.split('.');
        return [+major, +minor, +rev];
    }
    _mergeObjectProperties(jsonObj1, jsonObj2) {
        for (const key in jsonObj2) {
            // eslint-disable-next-line no-prototype-builtins
            if (jsonObj2.hasOwnProperty(key) && jsonObj1[key] && typeof jsonObj1[key] === 'object' && typeof jsonObj2[key] === 'object') {
                this._mergeObjectProperties(jsonObj1[key], jsonObj2[key]);
            }
            else {
                jsonObj1[key] = jsonObj2[key];
            }
        }
    }
    async _cleanEmptyDirs(root) {
        const isDir = (await fs__default["default"].stat(root)).isDirectory();
        if (!isDir)
            return;
        const files = await fs__default["default"].readdir(root);
        for (const file of files) {
            await this._cleanEmptyDirs(path__default["default"].join(root, file));
        }
        if (files.length === 0)
            await fs__default["default"].rmdir(root);
    }
    async _copyV3ComponentsFiles(uid, projDir) {
        let tmpDir = undefined;
        let compDir = path__default["default"].join(__dirname, '../../designer/v3/components');
        const [projMajor, projMinor, projRev] = this.getComponentLibVerDetail((await fs__default["default"].readJson(path__default["default"].join(projDir, 'project.json'))).version);
        const [latestMajor, latestMinor, latestRev] = this.getComponentLibVerDetail((await fs__default["default"].readJSON(path__default["default"].join(__dirname, '../../designer/v3/components/version.json'))).version);
        // if not the latest version of the components, get it from components-server
        if (projMajor !== latestMajor || projMinor !== latestMinor || projRev !== latestRev) {
            try {
                this.logger.debug(`[${uid}] Getting components library from components-server for ${projDir}`);
                const { host, port } = await this.serviceProvider.getComponents();
                const url = `/gc/${projMajor}.${projMinor}.${projRev}?command=pack`;
                await fetch__default["default"](`http://${host}:${port}${encodeURI(url)}`, { method: 'get' }).then(async (res) => {
                    tmpDir = compDir = await fs__default["default"].mkdtemp(this.tmpDir);
                    /*
                     *  Extracts the library into the temp folder,
                     */
                    const temp = res.body.pipe(tar__default["default"].extract(tmpDir));
                    return new Promise((resolve, reject) => {
                        temp.on('finish', resolve);
                        temp.on('error', reject);
                    });
                });
            }
            catch (e) {
                if (tmpDir)
                    await fs__default["default"].remove(tmpDir);
                tmpDir = undefined;
            }
        }
        const atTIDir = path__default["default"].join(compDir, '@ti');
        const destDir = path__default["default"].join(projDir, 'components/@ti');
        await fs__default["default"].copy(atTIDir, destDir, { filter: (src, dest) => {
                const testStr = src.replace(/\\/g, '/');
                return (testStr.indexOf('.js.map') === -1)
                    && (testStr.indexOf('components/@ti/host.config.json') === -1)
                    && (testStr.indexOf('components/@ti/stencil-docs') === -1)
                    && (testStr.indexOf('components/@ti/index.html') === -1)
                    && (testStr.indexOf('components/@ti/index.js') === -1)
                    && (testStr.indexOf('components/@ti/assets/stylesheets/gc-demo-stylesheet.css') === -1)
                    && (testStr.match(/.*\/components\/@ti\/(?!(build|gc-.*\/lib))(gc-.*)\/(demo|test|usage.md|readme.md|.*.js|.*.css)/gi) === null);
            } });
        /* remove working folders */
        if (tmpDir)
            await fs__default["default"].remove(tmpDir);
        await this._cleanEmptyDirs(destDir);
    }
    async _copyPackageJSONForCCSExport(projDir) {
        const appDirPackageJSON = path__default["default"].join(__dirname, '../../app/package.json');
        const projJsonPath = path__default["default"].join(projDir, 'project.json');
        const packageJsonPath = path__default["default"].join(projDir, 'package.json');
        /* copy only the package.json file */
        await fs__default["default"].copy(appDirPackageJSON, path__default["default"].join(projDir, 'package.json'));
        const [projJson, packageJson] = await Promise.all([
            fs__default["default"].readJson(projJsonPath),
            fs__default["default"].readJson(packageJsonPath),
        ]);
        if (projJson.window && packageJson.window) {
            this._mergeObjectProperties(packageJson.window, projJson.window);
        }
        else if (projJson.window) {
            packageJson.window = projJson.window;
        }
        if (projJson.applicationName) {
            packageJson.name = projJson.applicationName;
        }
        return fs__default["default"].writeFile(packageJsonPath, JSON.stringify(packageJson, null, 4));
    }
    async _copyRuntimeFiles(projDir) {
        const appDir = path__default["default"].join(__dirname, '../../app');
        const projJsonPath = path__default["default"].join(projDir, 'project.json');
        const splashHtmlPath = path__default["default"].join(projDir, 'splash', 'splashscreen.html');
        const packageJsonPath = path__default["default"].join(projDir, 'package.json');
        /* filter files that are not required by the user application */
        await fs__default["default"].copy(appDir, projDir, { filter: (src, dest) => {
                const testStr = src.replace(/\\/g, '/');
                return (testStr.indexOf('.js.map') === -1)
                    && (testStr.indexOf('/src') === -1)
                    && (testStr.indexOf('project.json') === -1)
                    && (testStr.indexOf('package-lock.json') === -1)
                    && (testStr.indexOf('index.js') === -1)
                    && (testStr.indexOf('index.html') === -1)
                    && (testStr.indexOf('/node_modules') === -1);
            } });
        // eslint-disable-next-line prefer-const
        let [projJson, packageJson, splashHtml] = await Promise.all([
            fs__default["default"].readJson(projJsonPath),
            fs__default["default"].readJson(packageJsonPath),
            fs__default["default"].readFile(splashHtmlPath, 'utf-8')
        ]);
        splashHtml = splashHtml.replace('%SPLASH_VENDOR_NAME%', projJson.tiBrandingEnabled ? '' : (projJson.vendorName || ''));
        splashHtml = splashHtml.replace('%SPLASH_VENDOR_LOGO%', projJson.tiBrandingEnabled ? 'ti_horiz_banner_white.svg' : (projJson.applicationIcon || ''));
        splashHtml = splashHtml.replace('%SPLASH_IMG%', projJson.splashImage || '');
        splashHtml = splashHtml.replace('%SPLASH_APP_NAME%', projJson.applicationName || '');
        splashHtml = splashHtml.replace('%SPLASH_APP_TECH_NAME%', projJson.technologyName || '');
        await fs__default["default"].writeFile(splashHtmlPath, splashHtml);
        if (projJson.window && packageJson.window) {
            this._mergeObjectProperties(packageJson.window, projJson.window);
        }
        else if (projJson.window) {
            packageJson.window = projJson.window;
        }
        if (projJson.applicationName) {
            packageJson.name = projJson.applicationName;
        }
        return fs__default["default"].writeFile(packageJsonPath, JSON.stringify(packageJson, null, 4));
    }
    _isRuntimeFile(filePath) {
        const pos = filePath.indexOf('/');
        if (pos >= 0) {
            filePath = filePath.substring(pos + 1); // strip the project name
        }
        const runtimeFiles = [
            'package.json',
            'app_server.js',
            'ApplicationServer.js',
            'launcher.json',
            'launcher.exe',
            'launcher.lnx',
            'launcher.osx',
            'about.html',
            'previewTemplate.html',
            'win32_debug.bat',
            'wind32_start.bat',
            'linux_start_debug.sh',
            'linux_start.sh',
            'mac_start',
            'splash',
            'TargetConfig.js',
            'tsconfig.json',
            'assets/window_icon.png'
        ];
        return runtimeFiles.find(file => filePath.startsWith(file)) !== undefined;
    }
    ;
    async _getProjectJson(headers, uid, projName) {
        const { host, port } = await this.serviceProvider.getWorkspace(uid);
        return fetch__default["default"](`http://${host}:${port}/gc/default/${projName}/project.json`, { method: 'get', headers: headers }).then(res => res.json());
    }
    /**
     * A helper method to call the available resource API.
     *
     * @param command the command name
     * @param params the command parameters
     */
    async accept(command, params) {
        this._debug(params);
        const result = await this[command](params);
        return result instanceof RespondHandled ? result : JSON.stringify(result);
    }
    /**
     * Returns an array of immediate child resource(s) for the given pathname.
     * @param params.pathname the directory pathname.
     */
    async list(params) {
        const pathname = params.pathname;
        const files = await fs__default["default"].readdir(pathname);
        const promises = [];
        files.forEach(file => {
            promises.push(fs__default["default"].stat(path__default["default"].join(pathname, file)).then(stat => {
                return { name: file, isDirectory: stat.isDirectory() };
            }));
        });
        return Promise.all(promises);
    }
    /**
     * Returns whether the given pathname exist.
     * @param params.pathname the resource pathname.
     */
    async exists(params) {
        try {
            return !!await fs__default["default"].stat(params.pathname);
        }
        catch {
            return false;
        }
    }
    /**
     * Deletes runtime files.
     * @param params params.uid user id
     * @param params.headers the request header
     * @param params.args.projectPath the project path to delete the runtime files
     */
    async deleteRuntimeFiles(params) {
        const uid = params.uid;
        const headers = params.headers;
        const projectPath = this.controller.mapWorkspaceURL(params.args.projectPath.replace('/workspace/', '/'));
        const projectSegments = projectPath.split('/');
        const projectName = projectSegments.pop();
        if (!projectName) {
            throw new Error(`Invalid command argument: ${this.args.projectPath} is not a valid projectPath.`);
        }
        const workspacePath = projectSegments.join('/');
        const { host, port } = await this.serviceProvider.getWorkspace(uid);
        const _delFiles = async (_path) => {
            const files = await fetch__default["default"](`http://${host}:${port}${workspacePath}/${_path}?command=list`, { method: 'get', headers: headers }).then(res => res.json());
            if (files.code === -1) {
                throw new Error(files);
            }
            for (const _file of files) {
                const filePath = path__default["default"].join(_path, _file.name).replace(/\\/g, '/');
                if (this._isRuntimeFile(filePath)) {
                    await fetch__default["default"](`http://${host}:${port}${workspacePath}/${filePath}?command=delete`, { method: 'get', headers: headers });
                }
                else if (_file.isDirectory) {
                    await _delFiles(filePath);
                }
            }
        };
        this.logger.debug(`[${uid}] Start deleting runtime files for ${projectPath}`);
        await _delFiles(projectName);
        this.logger.debug(`[${uid}] Finished deleting runtime files for ${projectPath}`);
    }
    async _pack(params, archiver, extension, contentType) {
        if (!await this.exists(params)) {
            throw Error('File not found!');
        }
        const walk = async (dir) => {
            let files = await fs__default["default"].readdir(dir);
            files = await Promise.all(files.map(async (file) => {
                const filePath = path__default["default"].join(dir, file);
                const stats = await fs__default["default"].stat(filePath);
                if (stats.isDirectory())
                    return walk(filePath);
                else if (stats.isFile())
                    return filePath;
            }));
            return files.reduce((all, folderContents) => all.concat(folderContents), []);
        };
        const pathname = params.pathname;
        const noroot = params.args.noroot === 'true';
        const filename = path__default["default"].basename(pathname);
        const res = params.res;
        const stat = await fs__default["default"].stat(pathname);
        archiver.pipe(res);
        if (stat.isDirectory()) {
            const entries = await walk(pathname);
            entries.forEach((entry) => {
                let subpath = entry.substring(pathname.length + 1);
                if (!noroot) {
                    subpath = filename + path__default["default"].sep + subpath;
                }
                /* convert windows path to unix path */
                subpath = subpath.replace(/\\/g, '/');
                archiver.append(fs__default["default"].createReadStream(entry), { name: subpath });
            });
        }
        else {
            archiver.append(fs__default["default"].createReadStream(pathname), { name: filename });
        }
        this._setZipResponseHeader(res, `${filename}.${extension}`, contentType);
        await archiver.finalize();
        return new RespondHandled; // self terminate the request
    }
    /**
     * Returns a compressed file stream in tar or zip format.
     * @param params.pathname the resource pathname.
     * @param params.args.noroot 'true' if pack without a root folder
     * @param params.args.type either undefined, zip or tar
     */
    async pack(params) {
        const type = params.args.type;
        switch (type) {
            case 'zip':
                return this._pack(params, archiver__default["default"]('zip'), 'zip', 'zip');
            case 'tar':
            default:
                return this._pack(params, archiver__default["default"]('tar'), 'tar', 'x-tar');
        }
    }
    /**
     * Exports the project to the client in zip format.
     * @param params.uid user id
     * @param params.headers the request headers
     * @param params.args.projectPath path to the project to export
     * @param params.args.includeLibs true to include the components folder and runtime files
     * @param params.args.ccsExport true to include components, without runtime files and and target folder
     */
    async exportProject(params) {
        const uid = params.uid;
        const headers = params.headers;
        const projectPath = this.controller.mapWorkspaceURL(params.args.projectPath.replace('/workspace/', '/'));
        const ccsExport = params.args.ccsExport === 'true';
        const includeLibs = ccsExport || params.args.includeLibs === 'true';
        const rootName = params.args.root || '';
        const tmpDir = await fs__default["default"].mkdtemp(this.tmpDir);
        const projectName = path__default["default"].basename(projectPath);
        const projDir = path__default["default"].join(tmpDir, projectName);
        /* download project from workspace server */
        this.logger.debug(`[${uid}] Downloading project <${projectName}> from workspace server`);
        const { host, port } = await this.serviceProvider.getWorkspace(uid);
        await fetch__default["default"](`http://${host}:${port}${encodeURI(projectPath + '?command=pack&type=tar')}`, { method: 'get', headers: headers }).then(res => {
            /*
               Extracts the project into the temp folder,
               when project extract end, copy the components folder to the temp folder.
            */
            const temp = res.body.pipe(tar__default["default"].extract(tmpDir, appFilesToIgnore));
            return new Promise((resolve, reject) => {
                temp.on('finish', resolve);
                temp.on('error', reject);
            });
        });
        /* remove .exportignore files and folders */
        const exportIgnoreFilePath = path__default["default"].join(tmpDir, projectName, '.exportignore');
        if (await fs__default["default"].pathExists(exportIgnoreFilePath)) {
            this.logger.debug(`[${uid}] Removing ignored <${projectName}> files`);
            const ignores = ((await fs__default["default"].readFile(exportIgnoreFilePath, { encoding: 'utf-8' })).trim()).split('\n');
            const globPromises = [];
            ignores.forEach(ignore => {
                ignore = ignore.trim();
                if (ignore.length <= 0)
                    return;
                globPromises.push(new Promise((resolve, reject) => {
                    glob__default["default"](path__default["default"].join(tmpDir, projectName, ignore).replace(/\\/g, '/'), async (err, matches) => {
                        if (err)
                            reject(err);
                        else {
                            for (let i = 0; i < matches.length; ++i) {
                                try {
                                    const stat = await fs__default["default"].stat(matches[i]);
                                    if (stat.isDirectory()) {
                                        fileutils$3.rmdirSync(matches[i]); // use fs.rm when update to newer node
                                    }
                                    else {
                                        await fs__default["default"].unlink(matches[i]);
                                    }
                                }
                                catch (e) { /* ignore */ }
                            }
                            resolve(null);
                        }
                    });
                }));
            });
            await Promise.all(globPromises);
            this.logger.debug(`[${uid}] Finished removing ignored <${projectName}> files`);
        }
        /* calculate project dependencies */
        if (includeLibs) {
            this.logger.debug(`[${uid}] Calculating project <${projectName}> dependencies`);
            const projJson = await fs__default["default"].readJson(path__default["default"].join(projDir, 'project.json'));
            const compLibVer = this.getComponentLibVersion(projJson.version);
            /* legacy v2 project structure */
            if (compLibVer === 2) {
                const filePaths = await this._getHtmlFilePaths(path__default["default"].join(projDir, 'app'));
                const filePromises = [];
                filePaths.push(path__default["default"].join(projDir, 'index.html'));
                for (const filePath of filePaths) {
                    filePromises.push(getDependencies(filePath).then(async (components) => {
                        const compPromises = [];
                        for (const component of components) {
                            if (await fs__default["default"].pathExists(component)) {
                                compPromises.push(new Promise((resolve, reject) => {
                                    const name = path__default["default"].basename(component);
                                    tar__default["default"].pack(component, componentFilesToIgnore).pipe(tar__default["default"].extract(path__default["default"].join(projDir, 'components', name)))
                                        .on('finish', resolve)
                                        .on('error', reject);
                                }));
                            }
                        }
                        await Promise.all(compPromises);
                    }));
                }
                await Promise.all(filePromises);
                /* new v3 project structure */
            }
            else {
                await this._copyV3ComponentsFiles(uid, projDir);
            }
            if (!ccsExport) {
                this.logger.debug(`[${uid}] Copying runtime files for project <${projectName}>`);
                await this._copyRuntimeFiles(projDir);
            }
            else {
                this.logger.debug(`[${uid}] Removing target folder for project <${projectName}>`);
                await fs__default["default"].remove(path__default["default"].join(projDir, 'target'));
                await this._copyPackageJSONForCCSExport(projDir); // package.json is required for integrating with CCS Theia
            }
        }
        /* uploading the project to client */
        this.logger.debug(`[${uid}] Uploading zipped project <${projectName}> to client`);
        /* clean up temp folder */
        params.res.on('finish', async () => await fs__default["default"].remove(tmpDir));
        /* archive the temp folder and send to client */
        this._setZipResponseHeader(params.res, `${projectName}.zip`, 'zip');
        const archive = archiver__default["default"]('zip', {});
        archive.pipe(params.res);
        archive.directory(path__default["default"].join(tmpDir), rootName);
        archive.finalize();
        return new RespondHandled();
    }
    /**
     * Imports the project from the client in zip format.
     * @param params.uid user id
     * @param params.headers the request headers
     * @param params.args.workspaceDir the workspace folder to import the project into
     */
    async importProject(params) {
        const uid = params.uid;
        const headers = params.headers;
        const workspaceDir = this.controller.mapWorkspaceURL(params.args.workspaceDir.replace('/workspace/', '/'));
        /* list existing projects from workspace server */
        this.logger.debug(`[${uid}] List existing projects from the workspace server`);
        const { host, port } = await this.serviceProvider.getWorkspace(uid);
        const dirs = await fetch__default["default"](`http://${host}:${port}${encodeURI(`${workspaceDir}?command=list`)}`, { method: 'get', headers: headers }).then(res => res.json());
        /* pack the project and send to the workspace server */
        return new Promise((resolve, reject) => {
            this.logger.debug(`[${uid}] unpacking project file into temporary folder`);
            const unpacker = Unpacker.unpack(params.req, this.tmpDir);
            /* validate if the project is valid */
            unpacker.onValidate = async (projDir) => {
                let error = undefined;
                let projJson = undefined;
                let indexGUIExist = false;
                try {
                    projJson = await fs__default["default"].readJSON(path__default["default"].join(projDir, 'project.json'));
                }
                catch {
                    error = new Error('Missing project.json file.');
                }
                if (!error) {
                    const indexGUIPath = this.getComponentLibVersion(projJson.version) === 2 ? path__default["default"].join(projDir, 'app', 'index.gui') : path__default["default"].join(projDir, 'index.gui');
                    indexGUIExist = await fs__default["default"].pathExists(indexGUIPath);
                    this.logger.debug(`[${uid}] validating project integrity project, version=${projJson.version} and index.gui=${indexGUIExist}`);
                }
                if (!error && !projJson.version) {
                    error = new Error('Project JSON does not have a valid version number.');
                }
                else if (!error && !indexGUIExist) {
                    error = new Error('Missing the index.gui file.');
                }
                if (error) {
                    this.logger.critical(`[${uid}] ${error.message}`);
                    throw error;
                }
            };
            /* handles each unzipped entry */
            let origProjName = null;
            let projDir = null;
            unpacker.on('entry', async (entry) => {
                /* assume first entry is the project directory name, get unique project name */
                let entryPath = entry.zipPath || entry.path;
                const segments = entryPath.split('/');
                if (projDir === null) {
                    const dirName = origProjName = segments[0];
                    let match = false;
                    for (let i = 0; i < dirs.length; ++i) {
                        const dir = dirs[i];
                        if (dir.isDirectory && (dir.name === dirName)) {
                            match = true;
                            break;
                        }
                    }
                    projDir = match ? this._getFilenameWithDate(dirName) : dirName;
                    this.logger.debug(`[${uid}] Start uploading zip entry for project <${projDir}> t workspace server`);
                }
                segments.shift();
                segments.unshift(projDir);
                entryPath = segments.join('/');
                // this.logger.debug(`[${uid}] On entry (${entry.type}) ${entryPath}`); /* this is flooding the database */
                /* drop all runtime files and files that is being ignored */
                if (this._isRuntimeFile(entryPath) || (appFilesToIgnore.ignore && appFilesToIgnore.ignore(entryPath))) {
                    this.logger.debug(`[${uid}] Dropping file ${entryPath}`);
                    if (entry.type === 'File') {
                        Unpacker.drain(entry, (e) => {
                            e ? reject(e) : 0;
                        });
                    }
                    return;
                }
                /*
                    * Pipe each entry to the workspace server, or create a new directory.
                    * Since each request will be serialized by the workspace server,
                    * it is not necessary having to wait for responds before continue
                    * onto the next entry.
                    */
                if (entry.type === 'File') {
                    try {
                        await fetch__default["default"](`http://${host}:${port}${path__default["default"].join(workspaceDir, entryPath)}`, { method: 'put', headers: headers, body: entry });
                    }
                    catch (err) {
                        reject(err);
                    }
                }
                else {
                    try {
                        await fetch__default["default"](`http://${host}:${port}${path__default["default"].join(workspaceDir, entryPath) + '?command=create&directory=true'}`, { method: 'get', headers: headers });
                    }
                    catch (err) {
                        reject(err);
                    }
                }
            }).on('close', () => {
                this.logger.debug(`${uid} Finished importing project into ${projDir}`);
                resolve({ newProjName: projDir, origProjName: origProjName });
            }).on('error', reject);
        });
    }
    /**
     * Imports the project from a server. i.e the gallery server.
     * @param params.uid the user id
     * @param params.headers the request headers
     * @param params.args.workspaceDir the workspace folder to import the project into
     * @param params.args.sourceServerName the name of the source server to import the project from
     * @param params.args.sourceServerPath the path of the import project file from the source server
     */
    async importProjectFrom(params) {
        const uid = params.uid;
        const sourceServerName = params.args.server;
        const sourceServerPath = params.args.path;
        const headers = params.headers;
        const tmpDir = await fs__default["default"].mkdtemp(this.tmpDir);
        const workspaceDir = params.args.workspaceDir.replace('/workspace/', '/');
        try {
            /* request project from source server */
            this.logger.debug(`[${uid}] Requesting project content from ${sourceServerName}`);
            const { host, port } = await this.serviceProvider.getService({ role: sourceServerName, type: 'application' });
            const res = await fetch__default["default"](`http://${host}:${port}${encodeURI(sourceServerPath)}`, { method: 'get', headers: headers });
            const destDir = path__default["default"].join(tmpDir, 'unzipper');
            try {
                await Unpacker.extract(res.body, tmpDir, destDir);
                this.logger.debug(`[${uid}] Finished retrieving project content from ${sourceServerName}`);
            }
            catch (e) {
                this.logger.debug(`[${uid}] Failed to extract project files: ${e.toString()}`);
                throw e;
            }
            /* revert the components folder version by reading the html files and stripping out the version in the path */
            const [projName] = await fs__default["default"].readdir(destDir);
            const projDir = path__default["default"].join(destDir, projName);
            const projJson = await fs__default["default"].readJSON(path__default["default"].join(projDir, 'project.json'));
            // process component import paths for lib version less than v3
            if (this.getComponentLibVersion(projJson.version) < 3) {
                const appDir = path__default["default"].join(projDir, 'app');
                const htmlFilePaths = (await this._getHtmlFilePaths(appDir)).concat(path__default["default"].join(projDir, 'index.html')); /* add default index.html file to the list of html files to process */
                const readPromises = [];
                htmlFilePaths.forEach(htmlFilePath => {
                    readPromises.push(fs__default["default"].readFile(htmlFilePath, 'utf-8').then(content => {
                        return { path: htmlFilePath, content: content };
                    }));
                });
                const readResults = await Promise.all(readPromises);
                const writePromises = [];
                readResults.forEach(result => {
                    writePromises.push(fs__default["default"].writeFile(result.path, result.content.replace(/components\/gc\/[^/]+/g, 'components')));
                });
                await Promise.all(writePromises);
            }
            const projFile = path__default["default"].join(tmpDir, projName + '.zip');
            await new Promise((resolve, reject) => {
                const archive = archiver__default["default"]('zip', {});
                archive.pipe(fs__default["default"].createWriteStream(projFile).on('finish', resolve.bind(this, path__default["default"].join(projFile))).on('error', reject));
                archive.directory(projDir, projName);
                archive.finalize();
            });
            /* import the project into gc */
            const [server, content] = await Promise.all([
                this.serviceProvider.getGUIComposer(),
                fs__default["default"].readFile(projFile)
            ]);
            return await fetch__default["default"](`http://${server.host}:${server.port}${'/gc?command=importProject&workspaceDir=' + encodeURI(workspaceDir)}`, { method: 'put', headers: headers, body: content }).then(res => res.json());
        }
        finally {
            /* clean up temp folder */
            await fs__default["default"].remove(tmpDir);
        }
    }
    /**
     * Returns whether publish to Gallery is allowed.
     * @param params.headers the request headers
     */
    async publishProjectAllowed(params) {
        const headers = params.headers;
        if (params.req.headers.cookie && params.req.headers.cookie.indexOf('allowedPublish') !== -1) {
            return true;
        }
        const { host, port } = await this.serviceProvider.getGallery();
        return fetch__default["default"](`http://${host}:${port}/publish`, { method: 'get', headers: headers }).then(res => {
            return res.status === 200; // 200 allowed, 403 denied
        });
    }
    /**
     * Query the Gallery for published project info.
     * @param params.headers the request headers
     * @param params.args.name the name of the project
     * @param params.args.group the name of the group
     */
    async publishProjectQuery(params) {
        const headers = params.headers;
        const name = params.args.name;
        const group = params.args.group;
        const { host, port } = await this.serviceProvider.getGallery();
        let reqPath = '/publish?name=' + encodeURIComponent(name);
        if (group)
            reqPath += '&group=' + encodeURIComponent(group);
        return fetch__default["default"](`http://${host}:${port}${reqPath}`, { method: 'get', headers: headers }).then(res => res.json());
    }
    async doPublishV2Project(options) {
        /**
         * Prepare the online zip file.
         */
        const onlineZip = async () => {
            this.logger.debug(`[${options.uid} Preparing online zip file...]`);
            /* fetch project from workspace server */
            const { host, port } = await this.serviceProvider.getWorkspace(options.uid);
            const res = await fetch__default["default"](`http://${host}:${port}${encodeURI(options.projPath.replace('/workspace', ''))}?command=pack&type=tar`, { method: 'get', headers: options.headers });
            await new Promise((resolve, reject) => {
                const dest = tar__default["default"].extract(options.tmpDir, appFilesToIgnore);
                res.body.pipe(dest);
                dest.on('error', reject);
                dest.on('finish', resolve);
            });
            /* read all html files */
            const htmlFilePaths = (await this._getHtmlFilePaths(path__default["default"].join(options.tmpDir, options.projName, 'app'))).concat(path__default["default"].join(options.tmpDir, options.projName, 'index.html'));
            const htmlFiles = await Promise.all(htmlFilePaths.map(async (htmlFilePath) => {
                const content = await fs__default["default"].readFile(htmlFilePath, 'utf-8');
                return { path: htmlFilePath, content: content };
            }));
            /* replace component dir to include latest version */
            await Promise.all(htmlFiles.map(async (htmlFile) => {
                let result = htmlFile.content;
                result = result.replace(/href="components/g, 'href="components/gc/' + options.libVer);
                result = result.replace(/src="components/g, 'src="components/gc/' + options.libVer);
                await fs__default["default"].writeFile(htmlFile.path, result, 'utf-8');
            }));
            /* zip the project directory */
            return new Promise(resolve => {
                const name = options.projName + '_online.zip';
                const zipFilePath = path__default["default"].join(options.tmpDir, 'zipfiles', name);
                const output = fs__default["default"].createWriteStream(zipFilePath);
                const archive = archiver__default["default"]('zip', {});
                output.on('close', () => resolve({ 'path': zipFilePath, 'name': name }));
                archive.pipe(output);
                archive.directory(path__default["default"].join(options.tmpDir, options.projName), options.projName);
                archive.finalize();
            });
        };
        /*
         * Prepare the offline zip file.
         */
        const offlineZip = async () => {
            this.logger.debug(`[${options.uid} Preparing online zip file...]`);
            const { host, port } = await this.serviceProvider.getGUIComposer();
            /* export an offline (standalone) project file from GC server */
            const name = options.projName + '_standalone.zip';
            const zipFilePath = path__default["default"].join(options.tmpDir, 'zipfiles', name);
            const res = await fetch__default["default"](`http://${host}:${port}?command=exportProject&includeLibs=true&projectPath=${encodeURIComponent(options.projPath)}`, { method: 'get', headers: options.headers });
            const output = fs__default["default"].createWriteStream(zipFilePath);
            res.body.pipe(output);
            return new Promise((resolve, reject) => {
                output.on('close', () => resolve({ 'path': zipFilePath, 'name': name }));
            });
        };
        /* prepare zip files for the Gallery */
        const [{ name: onlineName }, { name: offlineName }] = await Promise.all([onlineZip(), offlineZip()]);
        this.logger.debug(`[${options.uid} Finished preparing zip files...]`);
        /* write the Gallery properties.json file */
        await fs__default["default"].writeJSON(path__default["default"].join(options.tmpDir, 'zipfiles', 'properties.json'), {
            online_name: onlineName,
            standalone_name: offlineName,
            name: options.pubName,
            description: options.pubDesc,
            version: options.pubVer,
            runtime_version: options.runtimeVer,
            group: options.pubGroup
        });
        /* zip the folder and send to the gallery server */
        this.logger.debug(`[${options.uid}] Preparing Gallery package.`);
        return await new Promise((resolve, reject) => {
            const zipFilePath = path__default["default"].join(options.tmpDir, options.projName + '.zip');
            const output = fs__default["default"].createWriteStream(zipFilePath);
            const archive = archiver__default["default"]('zip', {});
            output.on('close', () => resolve({ path: zipFilePath, length: archive.pointer() }));
            archive.pipe(output);
            archive.directory(path__default["default"].join(options.tmpDir, 'zipfiles'), false);
            archive.finalize();
        });
    }
    async doPublishV3Project(options) {
        /**
         * Prepare zip application zip file.
         */
        const { name: appZipName } = await (async () => {
            this.logger.debug(`[${options.uid} Preparing online zip file...]`);
            const { host, port } = await this.serviceProvider.getGUIComposer();
            /* export an offline (standalone) project file from GC server */
            const name = options.projName + '_standalone.zip';
            const zipFilePath = path__default["default"].join(options.tmpDir, 'zipfiles', name);
            const res = await fetch__default["default"](`http://${host}:${port}?command=exportProject&includeLibs=true&projectPath=${encodeURIComponent(options.projPath)}`, { method: 'get', headers: options.headers });
            const output = fs__default["default"].createWriteStream(zipFilePath);
            res.body.pipe(output);
            return new Promise((resolve, reject) => {
                output.on('close', () => resolve({ 'path': zipFilePath, 'name': name }));
            });
        })();
        this.logger.debug(`[${options.uid} Finished preparing zip files...]`);
        /* write the Gallery properties.json file */
        await fs__default["default"].writeJSON(path__default["default"].join(options.tmpDir, 'zipfiles', 'properties.json'), {
            online_name: appZipName,
            standalone_name: appZipName,
            name: options.pubName,
            description: options.pubDesc,
            version: options.pubVer,
            runtime_version: options.runtimeVer,
            group: options.pubGroup
        });
        /* zip the folder and send to the gallery server */
        this.logger.debug(`[${options.uid}] Preparing Gallery package.`);
        return await new Promise((resolve, reject) => {
            const zipFilePath = path__default["default"].join(options.tmpDir, options.projName + '.zip');
            const output = fs__default["default"].createWriteStream(zipFilePath);
            const archive = archiver__default["default"]('zip', {});
            output.on('close', () => resolve({ path: zipFilePath, length: archive.pointer() }));
            archive.pipe(output);
            archive.directory(path__default["default"].join(options.tmpDir, 'zipfiles'), false);
            archive.finalize();
        });
    }
    /**
     * Publish the project to the Gallery.
     * @param params.uid the user id
     * @param params.headers the request headers
     * @param params.args.projectPath the path of the project
     * @param params.args.name the name of the project used to publish
     * @param params.args.group the group to publish under
     * @param params.args.desc the description use to publish
     * @param params.args.ver the version number
     */
    async publishProject(params) {
        const uid = params.uid;
        const headers = params.headers;
        const projPath = params.args.projectPath;
        const tmpDir = await fs__default["default"].mkdtemp(this.tmpDir);
        const projName = path__default["default"].basename(projPath);
        const compLibVer = await this._getProjectJson(headers, uid, projName).then(projJson => this.getComponentLibVersion(projJson.version));
        const libVer = await fs__default["default"].readJSON(path__default["default"].join(__dirname, `../../designer/v${compLibVer}/components/version.json`)).then(json => json.version);
        this.logger.debug(`[${uid}] Start publishing project <${projName}> to the Gallery`);
        /* read runtime version */
        this.logger.debug(`${uid} Reading version.xml file for runtime version.`);
        const runtimeVer = await fs__default["default"].readFile(path__default["default"].join(__dirname, '../../version.xml'), 'utf-8').then(versionXml => {
            const start = versionXml.indexOf('<version>');
            const end = versionXml.indexOf('</version>');
            return start >= 0 && end > start ? versionXml.substring(start + 9, end) : '0';
        });
        /* create a temp directory to for the zip files */
        await fs__default["default"].mkdir(path__default["default"].join(tmpDir, 'zipfiles'));
        try {
            const result = compLibVer < 3 ?
                await this.doPublishV2Project({
                    tmpDir: tmpDir,
                    headers: params.headers,
                    uid: params.uid,
                    projName: projName,
                    projPath: projPath,
                    libVer: libVer,
                    pubName: params.args.name,
                    pubDesc: params.args.desc,
                    pubGroup: params.args.group,
                    pubVer: params.args.ver,
                    runtimeVer: runtimeVer
                }) :
                await this.doPublishV3Project({
                    tmpDir: tmpDir,
                    headers: params.headers,
                    uid: params.uid,
                    projName: projName,
                    projPath: projPath,
                    pubName: params.args.name,
                    pubDesc: params.args.desc,
                    pubGroup: params.args.group,
                    pubVer: params.args.ver,
                    runtimeVer: runtimeVer
                });
            if (result === null) {
                throw Error(`[${uid}] Failed to publish project ${projName}`);
            }
            else {
                headers['Content-Type'] = 'application/zip';
                headers['Content-Length'] = result.length.toString();
                const { host, port } = await this.serviceProvider.getGallery();
                const res = await fetch__default["default"](`http://${host}:${port}/publish`, { method: 'post', headers: headers, body: fs__default["default"].createReadStream(result.path) });
                const response = await res.text();
                if (res.status === 200) {
                    params.res.end(response);
                    this.logger.debug(`[${uid}] Finished publishing project <${projName}> to the Gallery`);
                }
                else {
                    throw Error(`[${uid}] Failed to publish project ${projName}, ${response}`);
                }
            }
        }
        finally {
            /* clean up temp folder */
            await fs__default["default"].remove(tmpDir);
        }
        return new RespondHandled; // self terminate the request
    }
    /**
     * Extract the zip file to the workspace server.
     * @param params.uid the user id
     * @param params.header the request headers
     * @param params.args.destPath the workspace server path
     */
    async extractContentTo(params) {
        const uid = params.uid;
        const headers = params.headers;
        const destPath = this.controller.mapWorkspaceURL(params.args.destPath.replace('/workspace', ''));
        const { host, port } = await this.serviceProvider.getWorkspace(uid);
        this.logger.debug(`[${uid}] Start extracting file to ${destPath}`);
        return new Promise((resolve, reject) => {
            this.logger.debug(`[${uid}] Start uploading files to workspace server`);
            const unpacker = Unpacker.unpack(params.req, this.tmpDir);
            /* pipe the each entry to the workspace server */
            unpacker.on('entry', async (entry) => {
                try {
                    const url = `http://${host}:${port}${encodeURI(destPath)}/${encodeURI(entry.zipPath)}`;
                    if (entry.type === 'File') {
                        await fetch__default["default"](url, { method: 'put', headers: headers, body: entry });
                    }
                    else {
                        await fetch__default["default"](`${url}?command=create&directory=true`, { method: 'get', headers: headers });
                    }
                }
                catch (e) {
                    reject(e);
                }
            }).on('close', () => {
                this.logger.debug(`[${uid}] Finished uploading files to workspace server`);
                resolve();
            });
        });
    }
}

/**
 *  Copyright (c) 2019, 2024 Texas Instruments Incorporated
 *  All rights reserved.
 *
 *   Redistribution and use in source and binary forms, with or without
 *   modification, are permitted provided that the following conditions
 *   are met:
 *
 *      Redistributions of source code must retain the above copyright
 *  notice, this list of conditions and the following disclaimer.
 *  notice, this list of conditions and the following disclaimer in the
 *  documentation and/or other materials provided with the distribution.
 *      Neither the name of Texas Instruments Incorporated nor the names of
 *  its contributors may be used to endorse or promote products derived
 *  from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 *  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 *  THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 *  PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 *  CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 *  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 *  OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
 *  OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 *  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 *  Original Author:
 *      Patrick Chuong, Texas Instruments, Inc.
 */
const USER_INFO_STR = 'ti-user-info';
const VER_REGEX$1 = /^v(\d+)?(.\d+)?(.\d+)?$/;
/**
 * An abstract class of the server controller.
 */
class AbstractController {
    constructor(provider, serverConfig, logger, isDesktop = false) {
        this._router = express__default["default"].Router();
        this.proxy = httpProxy__default["default"].createServer();
        this.serviceProvider = provider;
        this.tmpDir = path__default["default"].join(os__default["default"].tmpdir(), '.gc-tmp-dir/');
        this.logger = logger;
        // gracefully handle ECONNREFUSED error without crashing the server
        this.proxy.on('error', (err, req, res) => {
            this.logger.critical(err);
            res.statusCode = 503;
            res.end('Failed to proxy request to workspace server.');
        });
        this.serverConfig = 'window.gc = window.gc || {};\n';
        this.serverConfig += `window.gc.serverConfig = ${JSON.stringify(serverConfig)};`;
        fs__default["default"].removeSync(this.tmpDir);
        fs__default["default"].ensureDirSync(this.tmpDir);
        this.resourceHandler = new ResourceHandler(this, provider, this.tmpDir, logger);
        this.initializePolicies(this._router, isDesktop);
        this.initializeRoutes(this._router);
        // https://jira.itg.ti.com/browse/GC-3014
        // workaround directories not cleanup properly due to un-identifiable cause
        const pullInterval = 30 * 1000 * 60; // pull every 30min
        const maxFolderLifetime = 15 * 1000 * 60; // max folder life time is 15min
        setInterval(async () => {
            try {
                const currentMs = Date.now();
                const folders = await fs__default["default"].promises.readdir(this.tmpDir);
                for (const folder of folders) {
                    const folderPath = path__default["default"].join(this.tmpDir, folder);
                    const stat = await fs__default["default"].promises.stat(folderPath);
                    if (currentMs - stat.ctimeMs > maxFolderLifetime) {
                        await fs__default["default"].remove(folderPath);
                    }
                }
            }
            catch (e) {
                logger.critical(e);
            }
        }, pullInterval);
    }
    /**
     * Subclass can override this method to map the workspace url.
     */
    mapWorkspaceURL(url) {
        return url;
    }
    /**
     * Getter method for the router.
     */
    get router() {
        return this._router;
    }
    getQueryValue(query) {
        if (Array.isArray(query)) {
            query = query[0];
        }
        return query;
    }
    /**
     * Initialize the default routers for the controller.
     * @param router router instance
     */
    async initializeRoutes(router) {
        /*
         * dInfra status route
         */
        router.get('/status**', () => { });
        /*
         * server config route
         */
        router.get('**/server-config.js', (req, res) => {
            res.header('Content-Type', 'text/javascript');
            res.send(this.serverConfig);
        });
        /*
         * workspace|preview project component route
         *  => /workspace/default/<project>/<version>/components/**
         * modify the req.url and let default express handles the route
         */
        router.all(['/workspace/*/*/*/components/**', '/preview/*/*/*/components/**'], async (req, res, next) => {
            req.url = '/' + req.url.split('/').slice(4).join('/');
            next();
        });
        /*
         * previous components version that starts with '/v<major>.<minor>.<rev>/components' route
         */
        router.use((req, res, next) => {
            /*
             * If version is more than 3 segments, it is not the latest. Retrieve component resources by calling the concrete controller.
             */
            const segments = req.url.split('/');
            if (segments.length >= 2 && segments[1].match(VER_REGEX$1) && segments[2] === 'components' && segments[1].split('.').length > 1) {
                this.getComponentsResource(req, res, next);
                return;
            }
            next();
        });
        /*
         * all other workspace|preview project route
         *  => /workspace/**
         * modify the req.url and proxy to /workspaceserver
         */
        router.all(['/workspace/**', '/preview/**'], async (req, res, next) => {
            const userInfo = req.headers[USER_INFO_STR];
            const uid = querystring__default["default"].parse(userInfo).uid;
            if (this.serviceProvider) {
                try {
                    const server = await this.serviceProvider.getWorkspace(uid);
                    const urlObj = url__default["default"].parse(req.url, true);
                    const pathSegments = urlObj && urlObj.pathname ? urlObj.pathname.split('/') : [];
                    if (pathSegments.length >= 3) {
                        /* remove the leading /workspace segments */
                        pathSegments.splice(0, 2);
                        /* replace all /gc/workspace with /workspaceserver/gc in search string */
                        if (urlObj.search) {
                            for (const q in urlObj.query) {
                                urlObj.query[q] = urlObj.query[q].replace(/\/gc\/workspace\//g, '/workspaceserver/gc/');
                            }
                            urlObj.search = '?' + querystring__default["default"].stringify(urlObj.query);
                        }
                        /* remove component version segment before proxy to the workspace server */
                        if (pathSegments.length >= 3 && pathSegments[2].match(VER_REGEX$1)) {
                            pathSegments.splice(2, 1);
                        }
                        req.url = '/gc/' + pathSegments.join('/') + (urlObj.search ? urlObj.search : '');
                        /* let subclass to map the workspace URL */
                        req.url = this.mapWorkspaceURL(req.url);
                        this.proxy.web(req, res, {
                            target: 'http://' + server.host + ':' + server.port
                        });
                        return;
                    }
                }
                catch (reason) {
                    this.logger.fatal(reason);
                    next(reason);
                }
                ;
            }
            next();
        });
        /*
         * command routes
         */
        router.all('*', (req, res, next) => {
            const urlObj = url__default["default"].parse(req.url, true);
            const userInfo = this.getQueryValue(req.headers[USER_INFO_STR]);
            const command = this.getQueryValue(urlObj.query['command']);
            if (command) {
                const userInfoHeader = req.headers[USER_INFO_STR];
                this.resourceHandler.accept(command, {
                    res: res,
                    req: req,
                    headers: { 'ti-user-info': userInfoHeader ? userInfoHeader : 'local' },
                    pathname: path__default["default"].join(this.baseDir, unescape(urlObj.pathname || '')),
                    uid: querystring__default["default"].parse(userInfo || '').userId || 'unknown',
                    args: urlObj.query || {}
                }).then(result => {
                    if (!(result instanceof RespondHandled)) {
                        res.end(result);
                    }
                }).catch(err => {
                    const message = err && err.message ? err.message : 'Unspecified error!';
                    this.logger.critical(message);
                    res.status(406).end(message);
                });
            }
            else {
                next();
            }
        });
    }
    ;
    initializePolicies(router, isDesktop) {
        const contentSecurityPolicies = [
            // eslint-disable-next-line @typescript-eslint/quotes
            "default-src 'self' ws: https://*.ti.com https://*.abtasty.com wss://*.decibelinsight.net blob: data:;",
            // eslint-disable-next-line @typescript-eslint/quotes
            "object-src 'none';",
            // eslint-disable-next-line @typescript-eslint/quotes
            "child-src 'self' blob: data:;",
            // eslint-disable-next-line @typescript-eslint/quotes
            "connect-src 'self' ws: https://*.ti.com https://*.akamaihd.net https://*.tealiumiq.com https://*.googleapis.com https://*.google-analytics.com https://*.cloudflare.com https://*.decibelinsight.net https://*.abtasty.com https://*.g.doubleclick.net wss://*.decibelinsight.net https://*.px-cloud.net https://*.en25.com https://*.brightcove.com https://*.3playmedia.com https://*.boltdns.net date: blob: data:;",
            // eslint-disable-next-line @typescript-eslint/quotes
            "script-src 'self' data: https://*.ti.com  https://*.akamaihd.net https://code.jquery.com https://tags.tiqcdn.com https://*.tealiumiq.com https://*.google-analytics.com https://*.googletagmanager.com https://*.googleadservices.com https://googleads.g.doubleclick.net https://*.decibelinsight.net https://*.abtasty.com wss://*.decibelinsight.net https://*.brightcove.net https://*.px-cloud.net https://*.3playmedia.com https://*.zencdn.net data: blob: 'unsafe-inline' 'unsafe-eval';",
            // eslint-disable-next-line @typescript-eslint/quotes
            "style-src 'self' https://*.ti.com https://*.akamaihd.net https://*.googleapis.com 'unsafe-inline';",
            // eslint-disable-next-line @typescript-eslint/quotes
            "font-src 'self' https://*.ti.com https://fonts.gstatic.com data:;",
            `img-src 'self'${isDesktop ? ' file: ' : ' '}* 'unsafe-inline' data:;`,
            // eslint-disable-next-line @typescript-eslint/quotes
            "frame-src 'self' https://*.ti.com https://www.ti.com.cn/ https://www.tij.co.jp/ https://*.doubleclick.net https://www.youtube.com https://*.bluekai.com https://*.brightcove.net blob:;",
            // eslint-disable-next-line @typescript-eslint/quotes
            "base-uri 'self';",
            // eslint-disable-next-line @typescript-eslint/quotes
            "form-action 'self';",
            // eslint-disable-next-line @typescript-eslint/quotes
            "frame-ancestors 'self';",
        ].join(' ');
        /* respond headers */
        router.use((req, res, next) => {
            res.setHeader('content-security-policy', contentSecurityPolicies);
            next();
        });
        /* respond headers */
        router.use((req, res, next) => {
            res.setHeader('strict-transport-security', 'max-age=15768000');
            res.setHeader('x-frame-options', 'SAMEORIGIN');
            res.setHeader('x-xss-protection', '1; mode=block');
            res.setHeader('x-download-options', 'noopen');
            res.setHeader('x-content-type-options', 'nosniff');
            res.setHeader('referrer-policy', 'no-referrer-when-downgrade');
            if (!isDesktop) { // known issue with NWjs:  https://github.com/nwjs/nw.js/issues/8062
                /* enable shared array buffer for scripting */
                res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
                res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
            }
            next();
        });
    }
}

/**
 *  Copyright (c) 2019, 2024 Texas Instruments Incorporated
 *  All rights reserved.
 *
 *   Redistribution and use in source and binary forms, with or without
 *   modification, are permitted provided that the following conditions
 *   are met:
 *
 *      Redistributions of source code must retain the above copyright
 *  notice, this list of conditions and the following disclaimer.
 *  notice, this list of conditions and the following disclaimer in the
 *  documentation and/or other materials provided with the distribution.
 *      Neither the name of Texas Instruments Incorporated nor the names of
 *  its contributors may be used to endorse or promote products derived
 *  from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 *  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 *  THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 *  PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 *  CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 *  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 *  OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
 *  OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 *  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 *  Original Author:
 *      Patrick Chuong, Texas Instruments, Inc.
 */
/**
 * Returns the cloudagent platform.
 */
const getAgentPlatform = () => {
    switch (os.platform()) {
        case 'win32': return 'win';
        case 'linux': return 'linux';
        case 'darwin': return 'osx';
        default: return 'unsupported';
    }
};
const VER_REGEX = /^v(\d+)?(.\d+)?(.\d+)?$/;
/**
 * An abstract class of the server controller.
 */
class BasicController extends AbstractController {
    constructor(provider, serverConfig, logger, isDesktop = false) {
        super(provider, serverConfig, logger, isDesktop);
    }
    /**
     * Initialize the default routers for the controller.
     * @param router router instance
     */
    async initializeRoutes(router) {
        await super.initializeRoutes(this._router);
        router.get(['/ticloudagent/getConfigInfo', '/ticloudagent/getConfigInfo/'], async (req, res) => {
            try {
                const result = await this.targetConfig.getConfigInfo(getAgentPlatform());
                res.set('Content-Disposition', 'attachment;filename=target_setup.json');
                res.send(result);
            }
            catch (e) {
                res.sendStatus(404);
            }
        });
        router.get('/ticloudagent/getConfig/**', async (req, res) => {
            try {
                const [platform, connectionId, devicePath, deviceId] = req.path.replace('/ticloudagent/getConfig/', '').split('/');
                const xmlPath = devicePath === 'boards' ? 'boards' : 'devices';
                const xmlFile = devicePath === 'boards' || devicePath === 'devices' ? deviceId : devicePath;
                const result = await this.targetConfig.getConfig(platform, connectionId, xmlPath, xmlFile);
                res.set('Content-Disposition', 'attachment;filename=target.ccxml');
                res.send(result);
            }
            catch (e) {
                res.writeHead(500, {
                    'content-type': 'text/html; charset=utf8',
                });
                res.end('' + e);
            }
        });
        router.get('/ticloudagent/getFile/**', async (req, res) => {
            try {
                const segments = req.path.replace('/ticloudagent/getFile/', '').split('/');
                const platform = segments.splice(0, 1)[0];
                const version = segments.pop();
                const filepath = segments.join('/');
                const filename = segments[segments.length - 1];
                const result = await this.targetConfig.getFile(platform, filepath, version);
                res.set('Content-Disposition', `attachment;filename=${filename}`);
                res.send(result);
            }
            catch (e) {
                res.sendStatus(404);
            }
        });
        router.get('/ticloudagent/**', async (req, res) => {
            try {
                const reqPath = req.url.substring('/ticloudagent'.length + 1);
                const content = await fs__default["default"].readFile(path__default["default"].join(this.TICloudAgentPublicDir, reqPath), 'utf-8');
                res.header('Content-Type', 'application/javascript');
                res.send(content);
            }
            catch (e) {
                res.sendStatus(404);
            }
        });
        /*
         * handles /sysconfig/ routes
         */
        const sdkPaths = optimist__default["default"].argv['sdkPaths'];
        const sdkRoots = (sdkPaths ? sdkPaths.split(',') : []).map(sdkPath => convertToAbsolutePath(sdkPath.trim(), this.absoluteRootPath()));
        router.get(['/sysconfig/fetchAvailableProducts'], async (req, res) => {
            try {
                const results = [];
                for (let i = 0; i < sdkRoots.length; i++) {
                    const sdkRoot = sdkRoots[i];
                    if (!fs__default["default"].existsSync(sdkRoot)) {
                        continue;
                    }
                    const files = await fs__default["default"].readdir(sdkRoot);
                    for (const name of files) {
                        const fileName = fs__default["default"].existsSync(path__default["default"].join(sdkRoot, name, '.metadata', 'product.json')) ? 'product.json' : 'sdk.json';
                        const pathSegments = [`/availableProduct${i || ''}`, name, '.metadata', fileName];
                        const location = path__default["default"].join(sdkRoot, ...pathSegments.slice(1));
                        try {
                            const { name, version, displayName } = JSON5__default["default"].parse(await fs__default["default"].readFile(location, 'utf-8') || '');
                            if (name && version) {
                                results.push({ name, version, displayName: displayName ?? name, path: pathSegments.join('/'), location });
                            }
                        }
                        catch (e) {
                            // ignore errors reading individual product.json files.
                        }
                    }
                }
                res.header('Content-Type', 'application/json');
                res.send(JSON.stringify(results));
            }
            catch (e) {
                res.writeHead(500, {
                    'content-type': 'text/html; charset=utf8',
                });
                res.end('' + e);
            }
        });
        /*
          * add /sysconfig/ prefix to availableProducts routes, which can occur when images are loaded from the sdk
          * within markdown module descriptions.
          */
        router.get('/availableProduct*', (req, res, next) => {
            req.url = '/sysconfig' + req.url;
            next();
        });
        sdkRoots.forEach((sdkRoot, i) => {
            router.use(`/sysconfig/availableProduct${i || ''}/`, express__default["default"].static(sdkRoot));
        });
        let sysconfigPath = optimist__default["default"].argv['sysconfig']?.trim();
        if (sysconfigPath) {
            sysconfigPath = convertToAbsolutePath(sysconfigPath, this.absoluteRootPath());
            if (await fs__default["default"].pathExists(path__default["default"].join(sysconfigPath, 'out', 'dist'))) {
                sysconfigPath = path__default["default"].join(sysconfigPath, 'out', 'dist');
            }
            else if (await fs__default["default"].pathExists(path__default["default"].join(sysconfigPath, 'dist'))) {
                sysconfigPath = path__default["default"].join(sysconfigPath, 'dist');
            }
        }
        router.get('/sysconfig/getPath', async (req, res) => {
            try {
                if (!sysconfigPath) {
                    throw new Error('Missing sysconfig argument on command line.');
                }
                res.header('Content-Type', 'text/plain');
                res.send(sysconfigPath);
            }
            catch (e) {
                res.sendStatus(404);
            }
        });
        if (!sysconfigPath) {
            router.use('/sysconfig/**', (req, res) => res.sendStatus(404));
        }
        else {
            router.use('/sysconfig/', express__default["default"].static(sysconfigPath));
        }
        /*
             * previous components version that starts with '/v<major>.<minor>.<rev>/components' route
             */
        router.use((req, res, next) => {
            /*
                 * If version is more than 3 segments, it is not the latest. Retrive component resources by calling the concrete controller.
                 */
            const segments = req.url.split('/');
            if (segments.length >= 2 && segments[1].match(VER_REGEX) && segments[2] === 'components' && segments[1].split('.').length > 1) {
                this.getComponentsResource(req, res, next);
                return;
            }
            next();
        });
    }
}

/**
 *  Copyright (c) 2020, 2024 Texas Instruments Incorporated
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions
 *  are met:
 *
 *  *   Redistributions of source code must retain the above copyright
 *  notice, this list of conditions and the following disclaimer.
 *  notice, this list of conditions and the following disclaimer in the
 *  documentation and/or other materials provided with the distribution.
 *  *   Neither the name of Texas Instruments Incorporated nor the names of
 *  its contributors may be used to endorse or promote products derived
 *  from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 *  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 *  THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 *  PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 *  CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 *  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 *  OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
 *  OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 *  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
class WriteStream extends stream.Writable {
    constructor() {
        super(...arguments);
        this.buffer = Buffer.alloc(0);
    }
    _write(chunk, encoding, done) {
        this.buffer = Buffer.concat([this.buffer, chunk]);
        done();
    }
    getData() {
        const ab = new ArrayBuffer(this.buffer.length);
        const view = new Uint8Array(ab);
        for (let i = 0; i < this.buffer.length; ++i) {
            view[i] = this.buffer[i];
        }
        return view;
    }
    getDataStr() {
        return new util.TextDecoder('utf-8').decode(this.getData());
    }
}
/**
 * Local CloudAgent target configuration.
 */
class TargetConfig {
    constructor(runtimeRoot) {
        this.runtimeRoot = runtimeRoot;
    }
    async instance() {
        this._initPromise = this._initPromise ?? new Promise((resolve, reject) => {
            /* eslint-disable @typescript-eslint/no-var-requires */
            (async () => {
                try {
                    const dInfraCommon = require(path__default["default"].join(this.runtimeRoot, './ticloudagent/server/common/dinfra_common'));
                    const dInfra = require(path__default["default"].join(this.runtimeRoot, './dinfra-library/desktop/dinfra'));
                    dInfraCommon.setDinfra(dInfra);
                    /* const dConfig = */ dInfra.configure({
                        origin: {
                            landscape: '127.0.0.1',
                            cluster: 'none',
                            instance: '127.0.0.1'
                        },
                        logging: {
                            'base-path': path__default["default"].join(os__default["default"].tmpdir(), 'ti_cloud_storage', 'gc_target_config'),
                            format: {
                                render: 'condensed'
                            }
                        },
                        databases: {
                            defaults: {
                                type: 'file',
                                path: path__default["default"].join(this.runtimeRoot, './deskdb')
                            }
                        },
                        paths: {}
                    });
                    resolve({
                        generateConfigImpl: require(path__default["default"].join(this.runtimeRoot, './ticloudagent/server/server_apis/generate_config')),
                        getConfigInfoImpl: require(path__default["default"].join(this.runtimeRoot, './ticloudagent/server/server_apis/get_config_info')),
                        getFileImpl: require(path__default["default"].join(this.runtimeRoot, './ticloudagent/server/server_apis/get_file'))
                    });
                }
                catch (e) {
                    reject(e);
                }
            })();
        });
        return this._initPromise;
    }
    createAgentPromise(callback) {
        return new Promise((resolve, reject) => {
            (async () => {
                const res = new WriteStream();
                res.on('finish', () => resolve(res.getDataStr()));
                res.on('error', reject);
                callback(res);
            })();
        });
    }
    async getConfig(OS, connectionID, xmlPath, deviceID, options) {
        return this.createAgentPromise(async (res) => {
            (await this.instance()).generateConfigImpl.default(connectionID, xmlPath, deviceID, OS, res);
        });
    }
    async getConfigInfo(OS) {
        return this.createAgentPromise(async (res) => {
            (await this.instance()).getConfigInfoImpl({ os: OS }, res);
        });
    }
    async getFile(OS, filepath, version = 'LATEST') {
        const xmlContents = await this.createAgentPromise(async (res) => {
            (await this.instance()).getFileImpl({ os: OS }, filepath, version, res);
        });
        return xmlContents;
    }
    parseConfig(ccxmlFileContents) {
        const xmldom = require(path__default["default"].join(this.runtimeRoot, './ticloudagent/server/node_modules/xmldom'));
        let xmlParseError = '';
        function xmlParserErrorHandler(level, msg) {
            xmlParseError = xmlParseError ?? msg.toString();
        }
        const xmlDoc = new xmldom.DOMParser({
            locator: {},
            errorHandler: xmlParserErrorHandler,
        }).parseFromString(ccxmlFileContents);
        if (xmlParseError) {
            throw new Error(xmlParseError);
        }
        return xmlDoc;
    }
    serializeConfig(ccxmlDocument) {
        const xmldom = require(path__default["default"].join(this.runtimeRoot, './ticloudagent/server/node_modules/xmldom'));
        // Sort attributes alphabetically to match legacy Java based Serializer.
        return new xmldom.XMLSerializer().serializeToString(ccxmlDocument, (a, b) => a.localeCompare(b));
    }
}

/**
 *  Copyright (c) 2019, 2024 Texas Instruments Incorporated
 *  All rights reserved.
 *
 *   Redistribution and use in source and binary forms, with or without
 *   modification, are permitted provided that the following conditions
 *   are met:
 *
 *      Redistributions of source code must retain the above copyright
 *  notice, this list of conditions and the following disclaimer.
 *  notice, this list of conditions and the following disclaimer in the
 *  documentation and/or other materials provided with the distribution.
 *      Neither the name of Texas Instruments Incorporated nor the names of
 *  its contributors may be used to endorse or promote products derived
 *  from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 *  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 *  THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 *  PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 *  CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 *  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 *  OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
 *  OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 *  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 *  Original Author:
 *      Patrick Chuong, Texas Instruments, Inc.
 */
const PARAM_SCRIPT = 'script';
const PARAM_LOGFILE = 'logfile';
class ApplicationController extends BasicController {
    constructor(provider, serverConfig, logger) {
        super(provider, serverConfig, logger, true);
        this.baseDir = path__default["default"].join(__dirname, '..');
        this.TICloudAgentPublicDir = path__default["default"].join(__dirname, '../runtime/ticloudagent/server/public');
        this.targetConfig = new TargetConfig(path__default["default"].resolve(__dirname, '../runtime'));
    }
    absoluteRootPath() {
        return __dirname;
    }
    getComponentsResource(req, res, next) {
        const segments = req.url.split('/');
        segments.splice(2, 1);
        req.url = segments.join('/').replace(/^\/v/, '/');
        next();
    }
    mapWorkspaceURL(url) {
        let result = url.replace('/gc', '/workspace'); // pathname
        result = result.replace('%2Fgc', '%2Fworkspace'); // query string
        result.split('/workspaceserver/app/Default').join('/workspace');
        return result;
    }
    async startCloudAgentHostApp() {
        if (!this.agentHostAppPromise) {
            const ext = os.platform() === 'win32' ? 'bat' : 'sh';
            const cwd = path__default["default"].join(__dirname, '../runtime/TICloudAgentHostApp');
            const executable = path__default["default"].join(`${cwd}/ticloudagent.${ext}`);
            this.agentHostAppPromise = new Promise((resolve, reject) => {
                let partialMessage = '';
                const app = require$$2__default["default"].spawn(executable, ['not_chrome'], { cwd: cwd });
                app.stdout.on('data', data => resolve(data.toString()));
                app.stderr.on('data', data => {
                    // cloudagent returns an error message 'Debugger attached.' when debugging in VSCode,
                    // however it is still functional without any issues.
                    partialMessage = partialMessage + data.toString();
                    const message = partialMessage.split('\n');
                    if (message.length > 1) {
                        partialMessage = message.pop();
                        if (message[0].trim() !== 'Debugger attached.') {
                            reject(message[0]);
                        }
                    }
                });
            }).then(data => {
                const _data = JSON.parse(data);
                _data.offline = true;
                _data.agentPort = _data.port;
                delete _data.port;
                console.log(`CloudAgent: ${JSON.stringify(_data)}`);
                return _data;
            });
        }
        return await this.agentHostAppPromise;
    }
    async initializeRoutes(router) {
        /* respond headers */
        router.use((req, res, next) => {
            /* enable shared array buffer for scripting */
            res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
            res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
            next();
        });
        router.get('**/version.xml', async (req, res) => {
            const content = await fs__default["default"].readFile(path__default["default"].join(__dirname, '../version.xml'), 'utf-8');
            res.header('Content-Type', 'text/xml');
            res.send(content);
        });
        /*
         * server config route
         */
        router.get('**/server-config.js', (req, res) => {
            const serverConfigObj = {
                isOnline: false
            };
            let serverConfig = 'window.gc = window.gc || {};\n';
            serverConfig += `window.gc.serverConfig = ${JSON.stringify(serverConfigObj)};`;
            res.header('Content-Type', 'text/javascript');
            res.send(serverConfig);
        });
        /*
         * handles ticloudagent routes
         */
        router.get('/ticloudagent/agent_config.json', async (req, res) => {
            try {
                const agentOutput = await this.startCloudAgentHostApp();
                res.header('Content-Type', 'application/json');
                res.send(agentOutput);
            }
            catch (e) {
                res.sendStatus(404);
            }
        });
        /* appscript route */
        if (optimist__default["default"].argv[PARAM_SCRIPT]) {
            router.get('/appscript', async (req, res) => {
                try {
                    const filepath = convertToAbsolutePath(optimist__default["default"].argv[PARAM_SCRIPT].trim(), this.absoluteRootPath());
                    const content = await fs__default["default"].readFile(filepath, 'utf-8');
                    res.header('Content-Type', 'text/plain');
                    res.send(content);
                }
                catch (e) {
                    res.sendStatus(404);
                }
            });
        }
        /* log file route */
        if (optimist__default["default"].argv[PARAM_LOGFILE]) {
            router.get('/appscript', async (req, res) => {
                const filepath = convertToAbsolutePath(optimist__default["default"].argv[PARAM_LOGFILE].trim(), this.absoluteRootPath());
                res.header('Content-Type', 'text/plain');
                res.send(filepath);
            });
        }
        /* api route */
        router.get('/api/shutdown', (req, res) => {
            console.log('Server shutting received...');
            res.header('Content-Type', 'text/plain');
            res.send('OK');
            if (!isNW) { /* shutdown for non-nodewebkit browser */
                this.shutdown(0);
            }
        });
        router.all(['/workspaceserver/app/Default/**'], async (req, res) => {
            const urlObj = url__default["default"].parse(req.url);
            const appName = urlObj.pathname ? urlObj.pathname.split('/')[4] : '';
            req.url = req.url.replace(`/workspaceserver/app/Default/${appName}`, '/workspace');
            res.redirect(req.url);
        });
        await super.initializeRoutes(router);
        /* default route */
        router.use(express__default["default"].static(path__default["default"].join(__dirname), { index: ['index.html', 'index.htm'], extensions: ['js'] }));
    }
    shutdown(code) {
        console.debug(`GUI Composer Server terminated, exit code = ${code}`);
        process.exit(code);
    }
}

var server$1 = {};

var http$2 = {};

/**
 * Tries to find an available port for the server to start listening to.
 * starts with a random number and of the ports is in use, tries the next.
 * until it exhaust all numbers between 10000 and 65000.
 *  
 * @param server - an HTTP server. 
 * @param callback (error, port)  
 */

var findPortAndListen = http$2.findPortAndListen = function( server, callback) {
	var min = 10000;
	var max = 55000;
	var start = min + Math.floor(Math.random() * max);
	var current = start + 1; 
	
	function getNext( current) {
		// roll over. We did not find a single port. 
		if( current === start) {
			return null;
		}
		if( current < max) {
			return current + 1;
		}
		return min;
	}
	
	function listenHTTPinner( current) {
		var onError = function(err){
			server.removeListener( "error", onError);
			server.removeListener( "listening", onListening);
			if( err.code === 'EADDRINUSE') {
				var next = getNext(current);
				if( next !== null) { 
					listenHTTPinner( next);
				}
				else {
					callback( new Error("Cannot find avaiable port."));
				};
			}
			else {
				callback( err);
			};
		};
		var onListening = function() {
			server.removeListener( "error", onError);
			server.removeListener( "listening", onListening);
			return callback( null, current);
		};
		server.once("error", onError);
		server.once("listening", onListening);
		server.listen( current);
	}
	
	listenHTTPinner( current);
};

var helper$2 = {};

/*******************************************************************************
 * 
 * @copyright 2015 Texas Instruments
 * @owner dalexiev
 * 
 * Helper functions.  
 * 
 *******************************************************************************/

function endOK(res) { 
	res.writeHead(200, {'Content-Type': 'text/json'});
	res.end("OK");
};

function endError( res, text) {
	res.writeHead(404, {'Content-Type': 'text/json'});
	res.end(text);
};

function validPathName( param) {
	if( param.indexOf("..") != -1)
		return false;
	return true;
};

function validFileName( param) {
	if( !validPathName(param))
		return false;
	if( param.indexOf("/") != -1)
		return false;
	if( param.indexOf("\\") != -1) 
		return false;
	return true;
};

var endOK_1 = helper$2.endOK = endOK; 
var endError_1 = helper$2.endError = endError;
var validPathName_1 = helper$2.validPathName = validPathName;
var validFileName_1 = helper$2.validFileName = validFileName;

var copyroute$1 = {};

/*******************************************************************************
 *
 * @copyright 2015 Texas Instruments
 * @owner dalexiev
 *
 * Helper to implement a copy route.
 *
 *******************************************************************************/

var url$1			= url__default["default"];
var fs$1			= require$$0__default["default"];
var path$1		= path__default["default"];
var http$1		= require$$3__default["default"];
var querystring$1 = querystring__default["default"];
var tar 		= tar__default["default"];
var tarstream 	= require$$6__default["default"];

var fileutils$1	= fileutils$3;
var helper$1 		= helper$2;

function initRequest( res, request) {
    if( request) {
        return request;
    };
    return {
        endError : function (message) {
            helper$1.endError(res, message);
        },
        endOK : function(){
            helper$1.endOK(res);
        }
    };
};

// convert synch to async, give priority to the new function 
function queryAsync( ports, appData, callback) {
	if( ports && ports.queryAsync && typeof ports.queryAsync === "function") {
		return ports.queryAsync( appData, callback); 
	}
	else if( ports && ports.query && typeof ports.query === "function") {
		return callback( ports.query( appData));
	}
	return callback(null);
}

var INVALID_FROM_PARAM = "Invalid from parameter.";
var INVALID_APP_REGISTRY = "Appication not properly registered.";
var CANNOT_IDENTIFY_USER = "Cannot identify the user.";

function getPackData( req, from, options, commandId, noroot, callback) {
	var uid = null;
    var userInfo = req.headers["ti-user-info"];
    if( !options.isLocal) {
        if( !userInfo) {
            callback( CANNOT_IDENTIFY_USER);
            return;
        };
        uid = querystring$1.parse(userInfo).userId;
        if( !uid) {
            callback( CANNOT_IDENTIFY_USER);
            return;
        };
    };

    if( !from) {
        callback(INVALID_FROM_PARAM);
        return;
    };
    if( !helper$1.validPathName(from)) {
        callback(INVALID_FROM_PARAM);
        return;
    };
    var toParts = from.split("/");
    if( toParts.length < 3) {
        callback(INVALID_FROM_PARAM);
        return;
    };
    if( toParts[0] !== "") {
        callback(INVALID_FROM_PARAM);
        return;
    };
    var app = toParts[1];
    if( !app) {
        callback(INVALID_FROM_PARAM);
        return;
    };
    var rootRoute = toParts[2];
    if( !rootRoute) {
        callback(INVALID_FROM_PARAM);
        return;
    };
    var restUrl = from.substring(app.length + rootRoute.length + 3);
    if( !restUrl) {
        callback(INVALID_FROM_PARAM);
        return;
    };
    restUrl = encodeURIComponent(restUrl);
    var localPath = "/"+rootRoute+"/"+restUrl+"?command=pack&type=tar";
    if( noroot) {
        localPath = localPath + "&noroot=true";
    };

    var appData = {
    	role : app, 
    	type: "application",
    };
    if( uid && app == "workspaceserver") {
    	appData.uid = uid;
    	appData.type = "applicationPerUser";
    }; 
    
    queryAsync( options.ports, appData, function( portInfo){
        var appInfo = undefined;
        if( portInfo && portInfo.length && portInfo[0] && portInfo[0].host && portInfo[0].port) {
            appInfo = portInfo[0];
        };

        if( !appInfo) {
            callback(INVALID_APP_REGISTRY);
            return;
        };

        var httpOptions = {
            hostname : appInfo.host,
            port : appInfo.port,
            path : localPath,
            method : "GET",
            agent : false  // work around the concurrent socket of node 0.10
        };

        var headers = {};
        if( commandId) {
            headers["ti-command-id"] = commandId;
        };

        if( !options.isLocal) {
            userInfo = { userId : uid};
            var userInfoText = querystring$1.stringify(userInfo);
            headers["ti-user-info"] = userInfoText;
        }
        httpOptions.headers = headers;

        var req = http$1.request( httpOptions, function(response) {
            if (response.statusCode !== 200) {
                return callback("Response status " + response.statusCode);
            };
            if( response.headers["content-type"] !== "application/x-tar") {
                return callback("Missign headers.");
            };
            callback( undefined, response);
        });

        // check for req error too
        req.on('error', function (err) {
            return callback(err.message);
        });
        req.end();
    });
};

function copyInternal( req, from, options, callback) {
    fs$1.stat( options.to, function( error, st) {
        if( error) {
            callback( error);
            return;
        }
        if( !st.isDirectory()) {
            callback( "Not a folder!");
            return;
        };
        getPackData( req, from, options, undefined, false, function( error, response) {
            if( error) {
                callback( error);
                return;
            };
            response.on('error', function() {
                callback("Transfer Error.");
            });
            var toStream = tar.extract(options.to);
            response.pipe(toStream).on('finish', function() {
                callback();
            });
            toStream.on("error", function(error) {
                callback(error.toString());
            });
        });
    });
};

/**
 *
 * @param req
 * @param res
 * @param options { ports, to }
 * @param request
 * @returns
 */
function copy( req, res, options, request) {
    request = initRequest( res, request);
    var parsedUrl = url$1.parse(req.url, true);
    var from = parsedUrl.query.from;
    var noroot = !!(parsedUrl.query.noroot);
    getPackData( req, from, options, request.commandId, noroot, function( error, response) {
        try {
            if (error) {
                request.endError(error);
                return;
            }

            response.on('error', function () {
                request.endError("Transfer Error.");
            });

            var toStream = tar.extract(options.to);
            response.pipe(toStream).on('finish', function () {
                request.endOK();
            });

            toStream.on("error", function (error) {
                request.endError(error.toString());
            });
        } catch(ex){
            request.endError(ex.toString());
        }
    });
};

/**
 * @param req
 * @param res
 * @param options { from }
 * @param request
 * @returns
 */
function send( req, res, options, request) {
    request = initRequest( res, request);

    if( !options.isLocal && !req.headers["ti-user-info"]) {
        return request.endError("Missing userid.");
    };

    var parsedUrl = url$1.parse(req.url, true);
    if( parsedUrl.query.type !== "tar") {
        return request.endError("Missing parameter pack.");
    };
    var noroot = parsedUrl.query.noroot;
    var from = options.from;
    fs$1.stat( from, function (error, stats) {
        if(error) {
            return request.endError(error.message);
        };
        if(stats.isFile() || stats.isDirectory()) {
            res.setHeader("Content-Type", "application/x-tar");
            var parentFolder = path$1.dirname(options.from);
            var folderName = path$1.basename(options.from);
            var readStream = null;
            if( noroot && stats.isDirectory()) {
                readStream = tar.pack( options.from);
            }
            else {
                readStream = tar.pack( parentFolder, { entries : [folderName ] });
            };
            readStream.pipe(res);
            req.addListener('end', function() {
                if( request.done) {
                    request.done();
                };
            });
        }
        else {
            return request.endError("Unsupprted file type.");
        };
    });
};

var copy_1 = copyroute$1.copy = copy;
var send_1 = copyroute$1.send = send;
var copyInternal_1 = copyroute$1.copyInternal = copyInternal;

var ccs$1 = {};

/*******************************************************************************
 * Copyright (c) 2024 Texas Instruments Incorporated - http://www.ti.com/
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     Texas Instruments Incorporated - initial API and implementation
 *
 * Original Author:
 *     Baltasar Belyavsky, Texas Instruments, Inc.
 *******************************************************************************/

var childProcess$1 = require$$2__default["default"];

var CMD_IMPORT = "ccs:import";
var CMD_BUILD = "ccs:build";

var initialize = ccs$1.initialize = function(cmds) {
    cmds[CMD_IMPORT]	= "ccs_import";
    cmds[CMD_BUILD]		= "ccs_build";    
};

var injectCommandHandlers = ccs$1.injectCommandHandlers = function(Request) {

    Request.prototype.ccs_import = function() {
        var self = this;

        self.dispatch(
            function() { // onFile
                self.endError(self.path + " is a file.");
            },
            function() { // onFolder
                try {
                    childProcess$1.exec('./ccs-server -nosplash ' +
                        '-data "/home/guest/.ccs-server/workspace_' + self.app + '" ' +
                        '-application com.ti.ccs.apps.projectImport ' +
                        '-ccs.location \'' + self.parsedUrl.query.location + '\' ' + // wrap location in single-quotes to prevent variable expansion
                        '-ccs.defaultImportDestination "' + self.path + '"', 
                        {
                            cwd: '/mnt/ccs/ccs/eclipse'
                        },
                        function(error, stdout, stderr) {
                            self.endJSON({ result: error? 'error': 'OK', output: stdout });
                        }
                    );
                } catch (e) {
                    self.endError(e.toString());
                }
            },
            null, // onMissing
            function(err) { // onError
                self.endError(err);
            }
        );
    };
    
    Request.prototype.ccs_build = function() {
        var self = this;

        self.dispatch(
            function() { // onFile
                self.endError(self.path + " is a file.");
            },
            function() { // onFolder
                try {
                    childProcess$1.exec('./ccs-server -nosplash ' +
                        '-data "/home/guest/.ccs-server/workspace_' + self.app + '" ' +
                        '-application com.ti.ccs.apps.projectBuild ' +
                        '-ccs.locations "' + self.path + '" ' +
                        '-ccs.autoImport ' +
                        '-ccs.autoOpen ' +
                        (self.parsedUrl.query.buildType ? '-ccs.buildType "' + self.parsedUrl.query.buildType + '" ' : '') +
                        (self.parsedUrl.query.configuration ? '-ccs.configuration "' + self.parsedUrl.query.configuration + '" ' : ''), 
                        {
                            cwd: '/mnt/ccs/ccs/eclipse' 
                        },
                        function(error, stdout, stderr) {
                            self.endJSON({ result: error? 'error': 'OK', output: stdout });
                        }
                    );
                } catch (e) {
                    self.endError(e.toString());
                }
            },
            null, // onMissing
            function(err) { // onError
                self.endError(err);
            }
        );
    };
   
};

/*******************************************************************************
 * Copyright (c) 2024 Texas Instruments Incorporated - http://www.ti.com/
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     Texas Instruments Incorporated - initial API and implementation
 *
 * Original Author:
 *     Dobrin Alexiev, Texas Instruments, Inc.
 *
 * Contributing Authors:
 *     Patrick Chuong, Texas Instruments, Inc. - Refactor for standalone tools.
 *******************************************************************************/

var httpServer;
var fs			= require$$0__default["default"];
var http		= require$$3__default["default"];
var path		= path__default["default"];
var querystring = querystring__default["default"];
var url			= url__default["default"];
var ncp			= require$$5__default["default"].ncp;
var serveStatic	= require$$6__default$1["default"];
var uuid 		= require$$7__default["default"];
var ncp 		= require$$5__default["default"].ncp;
var onFinished 	= require$$8__default["default"];
var du			= require$$9__default["default"];
var childProcess = require$$2__default["default"];

var fileutils	= fileutils$3;
var listen		= http$2.findPortAndListen;

var helper 		= helper$2;
var copyroute 	= copyroute$1;
var ccs			= ccs$1;

// commands.
var CMD_CLOSE = "close";
var CMD_GET = "getContent";
var CMD_PUT = "putContent";
var CMD_DELETE = "delete";
var CMD_LIST = "list";
var CMD_CREATE = "create";
var CMD_STATS = "stats";
var CMD_EXISTS = "exists";
var CMD_COPY = "copy";
var CMD_RENAME = "rename";
var CMD_PACK = "pack";
var CMD_CLONE = "clone";
var CMD_META = "meta";
var CMD_STORE = "store";
var CMD_DF = "df";

var HTTP_VERBS = {
	GET:CMD_GET,
	PUT:CMD_PUT,
	DELETE:CMD_DELETE
};

// atomic commands
var ATOMIC_CMDS = {
	"close"		: true,
	"putContent": true,
	"delete"	: true,
	"create"	: true,
	"copy"		: true,
	"rename"    : true,
	"clone"		: true,
	"meta"		: true,
	"store"		: true
};

// hook up the methods.
var cmds = {};
cmds[CMD_CLOSE] 	= "close";
cmds[CMD_GET] 		= "getContent";
cmds[CMD_PUT] 		= "putContent";
cmds[CMD_LIST] 		= "list";
cmds[CMD_DELETE] 	= "deleteItem";
cmds[CMD_CREATE] 	= "createItem";
cmds[CMD_STATS]		= "stats";
cmds[CMD_EXISTS]	= "exists";
cmds[CMD_COPY]		= "copy";
cmds[CMD_RENAME]	= "rename";
cmds[CMD_PACK]		= "pack";
cmds[CMD_CLONE]		= "clone";
cmds[CMD_META]		= "meta";
cmds[CMD_STORE]		= "store";
cmds[CMD_DF]		= "df";

// global variables
var gLog			= null;
var gRoot			= null;
var gCopySrcBaseDir	= null;
var gAppStorage		= null;
var gSeaports		= null;
var gActivityWatcher = null;
var isLocal			= false;
var gOptions        = null;

// delegates
var delegates = [ ccs ];

// initialize delegates
for(var i = 0; i < delegates.length; ++i) {
	delegates[i].initialize(cmds);
}

/************************************************************************************************************
 * WorkspaceLock Object.
 ************************************************************************************************************/

function WorkspaceLock( uid, workspace, callback) {
	var self = this;
	self.completed = false;
	self.clients = [ callback];
	var loadCompleted = function () {
		for(var i = 0; i < self.clients.length; ++i) {
			self.clients[i]();
		};
		self.completed = true;
	};

	gAppStorage.restore(uid, workspace, loadCompleted,
//		{"sessionId": params.browserSessionId}  // TODO (dobrin) - add the browser sessionID - it is only used in the logging.
		null);

// test code
//	fs.mkdir( workspace, function(e){
//		setTimeout( function() {
//			gAppStorage.restore(uid, workspace, loadCompleted,null);
//		}, 4000);
//	});
// end of test code
};

WorkspaceLock.prototype.wait = function( callback) {
	if( this.completed) {
		callback();
	};
	this.clients.push( callback);
};

/************************************************************************************************************
 * WorkspaceLoader Object.
 ************************************************************************************************************/

function WorkspaceLoader() {
	this.locks = {};
};

WorkspaceLoader.prototype.waitToLoad = function( uid, workspace, callback) {
	var lock = this.getLock(uid, workspace);
	if( !lock) {
		if( fs.existsSync(workspace)) {
			return callback();
		};
		this.addLock( uid, workspace, callback);
	}
	else {
		lock.wait( callback);
	}
};

WorkspaceLoader.prototype.getLock = function( uid, workspace) {
	if( !this.locks[uid]) {
		return undefined;
	};
	return this.locks[uid][workspace];
};

WorkspaceLoader.prototype.addLock = function( uid, workspace, callback) {
	var self = this;
	var lock = new WorkspaceLock( uid, workspace, callback);
	if( !self.locks[uid]) {
		self.locks[uid] = {};
	};
	self.locks[uid][workspace] = lock;
	// make sure we delete the object once wait completes.
	lock.wait( function() {
		delete self.locks[uid][workspace];
		if( Object.keys(self.locks[uid]) == 0){
			delete self.locks[uid];
		};
	});
};

var wsLoader = new WorkspaceLoader();

/************************************************************************************************************
 * Request Object.
 ************************************************************************************************************/
function Request() {
	var self = this;
	this.parsedUrl = null;
	this.completed = false;
	this.uid = null;
	this.command = null;
	this.urlPath = null;
	this.path = null;
	this.workspacePath = null;
	this.userRootPath = null;
	this.directory = false;
	this.filter = false;
	this.recursive = false;
	this.internalCommand = false;
	this.internalCallback = undefined;
	this.internalError = undefined;
	this.metaParams = { clearFlag : true, queryDBBackupFailed : undefined};
	this.timer = new setTimeout( function() {
		self.onMaxTime();
	},instrumentation.maxTime);
};

// inject delegate command handlers
for(var i = 0; i < delegates.length; ++i) {
	delegates[i].injectCommandHandlers(Request);
}

Request.prototype.deferredReqs = {};
Request.prototype.currentReqs = {};

Request.prototype.preventOnRoot = function() {
	return this.command == CMD_DELETE || this.command == CMD_RENAME || this.command == CMD_CLONE;
};

Request.prototype.init = function(req, res) {
	this.req = req;
	this.res = res;
	if (!isLocal) {
		var userInfo = this.req.headers["ti-user-info"];
		if( !userInfo) {
			this.endError( "Cannot identify the user. Missing header info.");
			return;
		};
		this.uid = querystring.parse(userInfo).userId;
		if( !this.uid) {
			this.endError( "Cannot identify the user. Missing userId inside header info.");
			return;
		};
	};

	var requestCommandId = this.req.headers["ti-command-id"];
	if( requestCommandId) {
		this.requestCommandId = requestCommandId;
	};

	this.logInfo("commands", "URL="+this.req.url);

	var parsedUrl = this.parsedUrl = url.parse(this.req.url, true);
	this.command = HTTP_VERBS[this.req.method];
	if( !this.command) {
		this.command = CMD_GET;
	};

	if( parsedUrl.query.command) {
		this.command = parsedUrl.query.command;
	};
	if( parsedUrl.query.filter) {
		this.filter = parsedUrl.query.filter;
	};
	if( parsedUrl.query.recursive) {
		this.recursive = (parsedUrl.query.recursive == "true");
	};
	if( parsedUrl.query.to) {
		var to = parsedUrl.query.to;
		if( !helper.validFileName(to)) {
			this.endError( "Invalid parameter:to.");
			return;
		}
		this.to = to;
	}

	// parse additional parameters
	if( parsedUrl.query.directory === "true") {
		this.directory = true;
	};

	if( parsedUrl.query.clearFlag == "false") {
		this.metaParams.clearFlag = false;
	};

	if( typeof parsedUrl.query.queryDBBackupFailed != undefined) {
		this.metaParams.queryDBBackupFailed = true;
	};

	try {
		this.urlPath = decodeURIComponent(parsedUrl.pathname);
	}
	catch( err) {
		this.endError( "Invalid Path.");
		return;
	};
	if( !helper.validPathName(this.urlPath)) {
		// prevent access to parent folders "..".
		this.endError( "Invalid Path.");
		return;
	};

	var pathSections = this.urlPath.split("/");
	if (!isLocal) {
		this.app = pathSections.length > 1 ? pathSections[1] : null;
		if( !this.app) {
			this.endError( "Missing app from the URL (first segment).");
			return;
		};
	};

	var workspaceSegment = !isLocal ? 2 : 1;
	this.workspaceName = pathSections.length > workspaceSegment ? pathSections[workspaceSegment] : null;
	if( !this.workspaceName) {
		this.endError( "Missing workspace from the URL (second segment).");
		return;
	};
	if( !this.validWorkspaceName(this.workspaceName)) {
		this.endError( "Invalid Path.");
		return;
	};

//	this.path = path.join(gRoot, !isLocal ? this.uid : "", this.urlPath);
//	this.workspacePath = path.join(gRoot, !isLocal ? this.uid : "", !isLocal ? this.app : "", this.workspaceName);
//	this.userRootPath = path.join(gRoot, !isLocal ? this.uid : "");

	this.path = path.join(gRoot, this.urlPath);

	if( isLocal) {
		this.workspacePath = path.join(gRoot, this.workspaceName);
	}
	else {
		this.workspacePath = path.join(gRoot, this.app, this.workspaceName);
	}
	this.userRootPath = path.join(gRoot, "");

	// some commands are not allowed on the root workspace folder.
	var rel = path.relative(this.workspacePath, this.path);
	if( rel.length == 0 && this.preventOnRoot()) {
		this.endError( this.command  + " cannot be executed on workspace root.");
		return;
	};

	if( !isLocal && pathSections.length > workspaceSegment + 1 && pathSections[workspaceSegment + 1] == SCRATCH_NAME) {
		this.path = path.join("/tmp", this.urlPath);
		this.userRootPath = path.join("/tmp", "");
	}
};

Request.prototype.initInternalClose = function( uid, workspacePath, callback) {
	this.command = CMD_CLOSE;
	this.internalCommand = true;
	this.internalCallback = callback;
	this.internalError = undefined;
	var pathSections = workspacePath.split("/");
	if( pathSections.length <= 3) {
		this.endError("Invalid workspace path");
		return;
	}
	this.workspacePath = workspacePath;
	this.workspaceName = pathSections[pathSections.length-1];
	this.app = pathSections[pathSections.length-2];
	this.uid = pathSections[pathSections.length-3];
	this.urlPath = "INTERNAL CLOSE COMMAND";
};

Request.prototype.logAny = function( stream, id, text) {
	var self = this;

	// Desktop Node App can be started without console.
	if( !gLog || !gLog[stream] || typeof gLog[stream] !== "function") {
		return;
	};

	var newText = text;
	if( self.uid) {
		newText = text + " userid = " + self.uid;
	};
	if( self.req) {
		gLog[stream](id, newText, self.req.url);
	}
	else {
		gLog[stream](id, newText);
	};
};

Request.prototype.logInfo = function( id, text) {
	this.logAny( "info", id, text);
};

Request.prototype.logError = function( id, text) {
	this.logAny( "error", id, text);
};

Request.prototype.validWorkspaceName = function( param) {
	if( !helper.validPathName(param))
		return false;
	if( param.indexOf("$") != -1)
		return false;
	if( param.indexOf("'") != -1)
		return false;
	if( param.indexOf('"') != -1)
		return false;
	if( param.indexOf("`") != -1)
		return false;
	return true;
};

Request.prototype.execute = function() {
	var self = this;
	if( self.isCompleted()) {
		return;
	};
	if( !self.command) {
		self.endError("Missing command.");
		return;
	};
	var current = null;
	for(var cmd in cmds) {
		if( cmd === self.command) {
			current = cmd;
			break;
		};
	};
	if( !current) {
		self.endError( "Unsupported command: "+ self.command);
		return;
	};

	function addToDeferReqsQ(req) {
		var defReqsQ = Request.prototype.deferredReqs[req.workspacePath];
		if (!defReqsQ) {
			Request.prototype.deferredReqs[req.workspacePath] = [req];
		} else {
			defReqsQ.push(req);
		}
	};

	/*
	 * If there are current requests, than we need to check whether the
	 * request can be execute in parallel with the current requests or not.
	 */
	var defer = false;
	var curReqsQ = Request.prototype.currentReqs[self.workspacePath];
	if (!!curReqsQ) {

		/* A copy from workspace to workspace generates getContent that needs be let through. */
		if( self.requestCommandId && self.requestCommandId == curReqsQ[0].commandId) {
			self.bypassQueue = true;
		}

		/* if the request is an atomic request, than just add it to the defer Q */
		else if (!!ATOMIC_CMDS[self.command]) {
			defer = true;
			addToDeferReqsQ(self);

		/* check if the request is compatible with current requests */
		} else if (curReqsQ.length > 0 && !!ATOMIC_CMDS[curReqsQ[0].command]){
			defer = true;
			addToDeferReqsQ(self);
		}
	}

	self.logInfo("commands-concurrent", (defer ? "Deferring " : "Executing ") + self.command + " where url=" + self.urlPath);
	if (!defer) {

		if( !self.bypassQueue) {
			if (!curReqsQ) {
				Request.prototype.currentReqs[self.workspacePath] = [self];
			} else {
				curReqsQ.push(self);
			}
		};

		self.ensureWorkspaceExists( function( error) {
// I have test cases that make operations take long time to complete so I can test the deferred queue.
			if( instrumentation.delay) {
				setTimeout( function(){
					if( !self.isCompleted()) {
						self[cmds[current]]();
					}
				},instrumentation.delay);
			}
			else {
				self[cmds[current]]();
			}
		});
	}
};

Request.prototype.done = function() {
	var self = this;
	if( self.timer) {
		clearTimeout( self.timer);
		self.timer = null;
	}
	if( self.internalCommand) {
		self.internalCallback( self.internalError);
	};

	self.logInfo("commands-concurrent", "Completed " + self.command + " where url=" + self.urlPath);

	if( self.bypassQueue) {
		return;
	};

	/* remove the current request from the Q */
	var curReqsQ = Request.prototype.currentReqs[self.workspacePath];
	if (!!curReqsQ) {
		for (var i = 0, l = curReqsQ.length; i < l; ++i) {
			if (curReqsQ[i] === self) {
				curReqsQ.splice(i, 1);
				break;
			}
		}

		if (curReqsQ.length == 0)
			delete Request.prototype.currentReqs[self.workspacePath];
	}

	/* In the case that the timeout expires and the request has never been removed
	   from the deferred queue make sure we remove it from there.*/
	var defReqsQ = Request.prototype.deferredReqs[self.workspacePath];
	if( defReqsQ && defReqsQ.length > 0) {
		for (var i = 0, l = defReqsQ.length; i < l; ++i) {
			if (defReqsQ[i] === self) {
				defReqsQ.splice(i, 1);
				break;
			}
		}

		if (defReqsQ.length == 0)
			delete Request.prototype.deferredReqs[self.workspacePath];
	};


	/* current request Q is empty, so move on to the next deferred request */
	if (!Request.prototype.currentReqs[self.workspacePath]) {
		defReqsQ = Request.prototype.deferredReqs[self.workspacePath];
		if (!!defReqsQ) {
			if (defReqsQ.length > 0) {
				var nextReq = defReqsQ.shift();
				if (defReqsQ.length == 0) {
					delete Request.prototype.deferredReqs[self.workspacePath];
				}

				nextReq.execute();
			}
		}
	}
};

/**
 *
 * @param onFile
 * @param onFolder
 * @param onMissing - optional
 * @param onError - optional
 */
Request.prototype.dispatch = function( onFile, onFolder, onMissing, onError ) {
	var self = this;
	self.logInfo("commands", self.command + " " + self.path);
	fs.stat( self.path, function(error, stats) {
		if( error) {
			if(onMissing && error.code == "ENOENT") {
				onMissing(error);
			}
			else {
				if( onError){
					onError( error);
				}
				else {
					self.endError( error.toString());
				}
			}
		}
		else if( stats.isDirectory()) {
			onFolder(stats);
		}
		else if( stats.isFile()) {
			onFile(stats);
		}
		else {
			self.endError( "Unsupported File Type");
		}
	});
};

Request.prototype.ensureWorkspaceExists = function( callback) {
	var self = this;

	// if the workspace is not in the file system: do nothing.
	// If we call twice close/close command we don't want to delete the record form the
	// the database.
	if( self.command == CMD_CLOSE) {
		self.workspaceExists = fs.existsSync(this.workspacePath);
		callback();
		return;
	};

	if (gAppStorage) {
		wsLoader.waitToLoad( self.uid, self.workspacePath, function(){
			self.workspaceExists = fs.existsSync(this.workspacePath);
			callback();
		});
	}
	else if( !isLocal) {
		if( !fs.existsSync(self.workspacePath)) {
			fileutils.mkdirSync(self.workspacePath);
			self.workspaceExists = fs.existsSync(self.workspacePath);
		}
		callback();
	}
	else {
		callback();
	}
};

Request.prototype.getContent = function() {
	var self = this;
	self.dispatch(
		function() { // onFile
			var fn = serveStatic(self.userRootPath, {dotfiles : "allow"});
			onFinished(self.res, function (){
				self.completed = true;
				self.done();
			});
			fn(self.req, self.res, function(err) {
				if( err && err.toString) {
					self.logError("commands", err.toString());
				};
			});
		},
		function() { // onFolder
			self.endError(self.path + " is a folder.");
		},
		null, // onMsising
		function(err) { // onError
			self.endError(err);
		}
	);
};

Request.prototype.pack = function() {
	var self = this;
	var options =  {
		from		: self.path,
		isLocal		: isLocal
	};
	copyroute.send( self.req, self.res, options, self);
};

Request.prototype.copy = function() {
	var self = this;
	var parsedUrl = url.parse(this.req.url, true);
	var from = parsedUrl.query.from;
	self.logInfo("commands", "copy from='" + from + "' to='" + self.path + "'");
	self.commandId = uuid.v4();
	var options =  {
		to			: self.path,
		ports		: gOptions.ports,
		isLocal		: isLocal
	};
	copyroute.copy( self.req, self.res, options, self);
};

Request.prototype.stats = function() {
	var self = this;
	var filter = function( data) {
		var prop = ["size", "atime", "mtime", "ctime"];
		var ret = {};
		for( var i = 0; i < prop.length; ++i) {
			if( typeof data[prop[i]] !== "undefined") {
				ret[prop[i]] = data[prop[i]];
			};
		};
		return ret;
	};

	self.dispatch(
		function(data) { //onFile
			self.endJSON(filter(data));
		},
		function(data) { //onFolder
			var ret = filter(data);
			if( self.recursive) {
				du(self.path, function(err, size) {
					if( err) {
						self.logError("commands", "Recursive Stats. Error = " + err + " Path = " + self.path);
						self.endError(err);
						return;
					};
					ret.size = size;
					self.logInfo("commands", "Recursive Stats. Size = " + size + " Path = " + self.path);
					self.endJSON(ret);
				});
				return;
			}
			self.endJSON(ret);
		},
		function(err) { //onError
			self.endError(err);
		},
		function(err) { //onMissing
			self.endError(err);
		}
	);
};

Request.prototype.df = function() {
	var self = this;
	childProcess.exec("df --block-size=1 " + gRoot, function(error, stdout, stderr) {
		if (error != null) {
			self.endError( error);
			return;
		}
		try{
			var lines = stdout.split("\n");
			var words = lines[1].split(/\s+/);
			var total = Number(words[1]);
			var available = Number(words[3]);
			var word4 = words[4];
			word4 = word4.substring(0, word4.length - 1);
			var percent = Number(word4);
			self.endJSON({
				total:total,
				available:available,
				percent:percent,
				warning:95
			});
		}
		catch( e) {
			self.endError( e);
		}
	});
};

Request.prototype.exists = function() {
	var self = this;
	self.dispatch(
		function(data) { //onFile
			self.endText("true");
		},
		function(data) { //onFolder
			self.endText("true");
		},
		function(err) { //onError
			self.endText("false");
		},
		function(err) { //onMissing
			self.endText("false");
		}
	);
};

Request.prototype.list = function() {
	var self = this;
	self.dispatch(
		function() { // onFile
			self.endError( self.path +" is a file.");
		},
		function() { // onFolder
			fs.readdir( self.path, function(error, files){
				if( error) {
					self.endError( error.toString());
					return;
				}
				var pattern = null;
				try {
					pattern = self.filter ? new RegExp(self.filter) : null;
				}
				catch( err) {
					self.logError("commands", err.toString());
					self.endError( err.toString());
					return;
				};
				var i = 0;
				var data = [];
				var filteredFiles = [];
				for( i = 0; i < files.length; ++i) {
					if( !isLocal && files[i] == SCRATCH_NAME) {
						continue;
					}

					if(!pattern || pattern.test(files[i])) {
						filteredFiles.push(files[i]);
					}
				};
				var total = filteredFiles.length;

				if( total == 0) {
					self.endJSON( data);
					return;
				};

				var filled = 0;
				var anyError = null;
				var fill = function( index) {
					var name = filteredFiles[index];
					data.push({ name : name});
					fs.stat( path.join(self.path, name), function(err, st) {
						if( err) {
							anyError = err;
							self.endError( err.toString());
						};
						if( anyError) {
							return;
						}
						data[index].isDirectory = st.isDirectory();
						data[index].size = st.size;
						data[index].atime = st.atime;
						data[index].ctime = st.ctime;
						data[index].mtime = st.mtime;
						++filled;
						if( filled >= total) {
							self.endJSON( data);
						};
					});
				};
				for( i = 0; i < total; ++i) {
					fill( i);
				};
			});
		}
	);
};

Request.prototype.putContent = function() {
	var self = this;
	self.tempUploadPath = null;
	self.unlinkOriginalFile = false;
	var fill = function() {
	//// TODO - make sure we don't exceed the quota.
	//// TODO - if we reach 90% of the quota fire an event to the proxy that (uid,app,workspace) has reached their limit.

		var stream = fs.createWriteStream(self.tempUploadPath);
		var requestEnded = false;
		var fileClosed = false;

		var allCompleted = function() {
			// The request is already completed. Do nothing.
			if( self.completed) {
				return;
			}

			// Wait for both file 'close' and request 'end' events to fire.
			if( !fileClosed || !requestEnded) {
				return;
			}

			// when a file is new we do not create a temporary file.
			var doNotDeleteAnything = function( path, callback) {
				callback();
			};
			var deleteFunction = self.unlinkOriginalFile ? fs.unlink : doNotDeleteAnything;
			deleteFunction( self.path, function(error) {
				if( self.completed) {
					return;
				};
				if( error) {
					self.logError("commands", "PUT " + self.path + " cannot override file.");
					self.endError("cannot override file " + self.path);
					return;
				};
				fs.rename( self.tempUploadPath, self.path, function( error) {
					if( self.completed) {
						return;
					};
					if( error) {
						self.logError("commands", "PUT " + self.tempUploadPath + " cannot rename file.");
						self.endError("cannot rename file " + self.tempUploadPath);
						return;
					};
					self.logInfo("commands", "PUT " + self.path + " ended.");
					self.endOK();
				});
			});
		};

		stream.on("close", function() {
			fileClosed = true;
			allCompleted();
		});

		self.req.on("end", function() {
			requestEnded = true;
			allCompleted();
		});

		// Handle file stream exceptions.
		// To simulate: Just before the file is opened in createWriteStream, create a ~file and make it read-only.
		stream.on("error", function() {
			// The request is already completed. Do nothing.
			if( self.completed) {
				return;
			};
			self.logError("commands", "PUT " + self.tempUploadPath + " cannot open file for writing.");
			self.endError("cannot open file for writing " + self.tempUploadPath);
		});

		// the connection has closed before uploaded completed. Remove the temp upload file and return error.
		// To simulate: In 'workspacetestclient' use the function generateLongText(), press 'Put' button and close the browser.
		if (process.versions.node.split('.')[0] <= 14) { // https://jira.itg.ti.com/browse/GC-3127
			self.req.on("close", function() {
			// The request is already completed. Do nothing.
				if( self.completed) {
					return;
				};
				fs.unlink( self.tempUploadPath, function( error) {
					if( self.completed) {
						return;
					};
					self.logError("commands", "PUT " + self.tempUploadPath + " conenction closed by client.");
					self.endError( self.path +" conenction closed by client.");
				});
			});
		}

		self.req.pipe(stream);
	};
	self.dispatch(
		function() { // onFile
			self.unlinkOriginalFile = true;
			self.setTempUploadPath( function( error) {
				if( error) {
					// setTempUpdaloadName already replied with error.
					return;
				};
				fill();
			});
		},
		function() { // onFolder
			self.endError( self.path +" already exists as folder.");
		},
		function() { // onMsising
			self.unlinkOriginalFile = false;
			var parent = path.dirname( self.path);
			fileutils.mkdirSync(parent);
			// the file does not exist here.
			self.setTempUploadPath( function( error) {
				if( error) {
					// setTempUpdaloadName already replied with error.
					return;
				};
				fill();
			});
		}
	);
};

Request.prototype.setTempUploadPath = function( callback) {
	var self = this;
	var parent = path.dirname( self.path);
	var fileName = path.basename( self.path);
	function nameExists( name, files) {
		for( var i = 0; i < files.length; ++i) {
			if( files[i] == name)
				return true;
		};
		return false;
	};

	fs.readdir( parent, function(error, files){
		if( error) {
			self.logError("commands", "PUT " + self.path + " ended with error:" + error.toString());
			self.endError( error.toString());
			callback( error);
			return;
		};
		var prefix = "~";
		while( nameExists(prefix + fileName, files)) {
			prefix += "~";
		};
		self.tempUploadPath = path.join(parent, prefix + fileName);
		callback();
	});
};

Request.prototype.deleteItem = function() {
	var self = this;
	self.dispatch(
		function() { // onFile
			fs.unlink(self.path, function (err) {
				if( err) {
					self.endError( err.toString());
				}
				else {
					self.endOK();
				}
			});
		},
		function() { // onFolder
			fileutils.rmdirSync(self.path);
			self.endOK();
		}
	);
};

Request.prototype.rename = function() {
	var self = this;
	if( !self.to) {
		self.endError( "Invalid parameter.");
		return;
	};
	var both = function() {
		var toPath = path.join(path.dirname(self.path), self.to);
		fs.stat( toPath, function(error, stats) {
			if(error && error.code == "ENOENT") {
				fs.rename(self.path, toPath, function( error) {
					if( error) {
						self.endError( error.toString());
					}
					else {
						self.endOK();
					};
				});
			}
			else {
				self.endError( "File "+self.to+" already exists.");
			}
		});
	};
	self.dispatch( both, both);
};

Request.prototype.clone = function() {
	var self = this;
	if( !self.to) {
		self.endError( "Invalid parameter.");
		return;
	};

	var toPath = path.join(path.dirname(self.path), self.to);
	var both = function() {
		ncp(self.path, toPath, function(error) {
			if( error) {
				self.endError( error.toString());
				return;
			};
			self.endOK();
		});
	};

	fs.stat( toPath, function(error, stats) {
		if(error && error.code == "ENOENT") {
			self.dispatch( both, both);
			return;
		};
		if( error) {
			self.endError( error.toString());
			return;
		}
		self.endError( "Resource " + self.to+" already exists.");
	});
};

Request.prototype.createItem = function() {
	var self = this;
	self.dispatch(
		function() { // onFile
			self.endError( self.path +" File already exist.");
		},
		function() { // onFolder
			self.endError( self.path +" Folder already exist.");
		},
		function() { // onMissing
			if( self.directory) {
				try {
					fileutils.mkdirSync(self.path);
					self.endOK();
				} catch (e) {
					self.endError(e.toString());
				}
			}
			else {
				fs.open( self.path, "wx", function (err, fd) {
					if( err) {
						self.endError( error.tioString());
					}
					else {
					    fs.close(fd, function (err) {
					    	if(err) {
					    		self.endError( error.tioString());
					    	}
					    	else  {
					    		self.endOK();
					    	};
					    });
					};
				});
			};
		}
	);
};

//TICLD-1893
var SCRATCH_NAME = ".scratch_1764";
//end TICLD-1893

Request.prototype.close = function() {
	var self = this;
	self.logInfo("commands", "CLOSE " + self.workspaceName);
	if( !gAppStorage) {
		self.endOK();
		return;
	};
	// If we call workspace second time the temp storage will be removed
	// this is considered normal condition, we should not try to override the database and return OK.
	if( !self.workspaceExists) {
		self.endOK();
		return;
	};

// TICLD-1893
	var scratchFolder = path.join( self.workspacePath, SCRATCH_NAME);
	fileutils.removeItem(scratchFolder, function() {
// end TICLD-1893
		gAppStorage.store(self.uid, self.workspacePath, null,
			null,
//			params.sessionId,  // TODO - add the sessionID - it is only used in the logging.
			function(err) {
				if(err) {
					self.endError(err.toString());
					return;
				}
				self.endOK();
			},
//			{"sessionId": params.browserSessionId}  // TODO - add the browser sessionID - it is only used in the logging.
			null
		);
	});
};

// https://jira.itg.ti.com/browse/GC-1055
Request.prototype.store = function() {
	var self = this;
	self.logInfo("commands", "store " + self.workspaceName);

	if( !gAppStorage) {
		self.endOK();
		return;
	};

	gAppStorage.store(self.uid, self.workspacePath, null,
		null,
//			params.sessionId,  // TODO - add the sessionID - it is only used in the logging.
		function(err) {
			if(err) {
				self.endError(err.toString());
				return;
			}
			self.endOK();
		},
//			{"sessionId": params.browserSessionId}  // TODO - add the browser sessionID - it is only used in the logging.
		null,
		true,
		SCRATCH_NAME
	);
};

Request.prototype.meta = function() {
	var self = this;
	self.logInfo("commands", "meta wks = " + self.workspaceName +" params = " + JSON.toString(self.metaParams));
	var ret = {};
	if( self.metaParams.queryDBBackupFailed) {
		var filePath = path.join(self.workspacePath, ".metadata", "DBBackupFailed");
		fs.stat( filePath, function( error, stat) {
			ret.queryDBBackupFailed = ( error && error.code == "ENOENT") ? false : true;
			if( ret.queryDBBackupFailed && self.metaParams.clearFlag) {
				fs.unlink( filePath, function(err) {
					self.endJSON( ret);
				});
				return;
			}
			self.endJSON( ret);
		});
		return;
	}
	self.endJSON( ret);
};
// end https://jira.itg.ti.com/browse/GC-1055

Request.prototype.isCompleted = function() {
	return this.completed;
};

Request.prototype.endError = function(msg) {
	if( this.internalCommand) {
		this.internalError = msg;
	};
	this.endJSON({msg: msg, code: -1}, 404);
};

Request.prototype.endOK = function() {
	this.endText("OK");
};

Request.prototype.endText = function(text, status) {
	this.completed = true;
	if( this.res) {
		this.res.writeHead(status ? status : 200, {'Content-Type': 'text/json'});
		this.res.end(text);
	}
	this.done();
};

Request.prototype.endJSON = function(obj, status) {
	var self = this;
	self.completed = true;
	if( self.res) {
		try{
			self.res.writeHead(status ? status : 200, {'Content-Type': 'text/json'});
			self.res.end(JSON.stringify(obj));
// https://jira.itg.ti.com/browse/TICLD-2163
// In rare cases when the header is aready sent we don't want the process to end.
// I have not tested if this exception is thrown mutiple times.
		}catch( error) {
			self.logError("command", "endJSON exception. Commnad = " + self.command + " Exception = " + error);
		}
	}
	this.done();
};

Request.prototype.onMaxTime = function() {
	var self = this;
	self.logError("command", "Timer expired. Commnad = " + self.command + " Path " + self.path);
	if( self.isCompleted()) {
		return;
	};
	this.endError( "Timeout.");
};

/************************************************************************************************************
 * Webserver
 ************************************************************************************************************/
var start = server$1.start = function(log, options, callback) {
	gLog = log;
	gRoot = options.root;
	gOptions = options;
	isLocal = !!options.isLocal;

	var self = this;
	var server = http.createServer(function(req, res) {
		// Let the status responder handle this request.
		// We should prevent the user from creating workspace called status when we have these API.
		if( req.url.indexOf("/status/") === 0) {
			return;
		};
		if( quiesced) {
			res.writeHead(404, {'Content-Type': 'text/json'});
			res.end(JSON.stringify({ msg : "Invalid server state: quiesced."}));
			return;
		};
		var r = new Request();
		r.init(req, res);
		if( gActivityWatcher) {
			gActivityWatcher.onNewRequest(r);
		};
		r.execute();
	});
	httpServer = server$1.httpServer = server;

	if (typeof options.port != 'undefined') {
		server.listen(options.port, '0.0.0.0', 30, function(error){
			if( error) {
				return callback(error);
			}
			callback(null, server.address().port);
		});
	} else {
		listen(server, callback);
	}
};

var addAppStorage = server$1.addAppStorage = function(appStorage) {
	gAppStorage = appStorage;
};

// TODO once the new copy is used remove this.
var addSeaports = server$1.addSeaports = function(seaports) {
	gSeaports = seaports;
};

// TODO once we move to new copy remove this.
var setCopySrcBaseDir = server$1.setCopySrcBaseDir = function(directory) {
	gCopySrcBaseDir = directory;
};

var setActivityWatcher = server$1.setActivityWatcher = function( watcher) {
	gActivityWatcher = watcher;
};

var quiesced = false;

var quiesce = server$1.quiesce = function() {
	quiesced = true;
};

var instrumentation = {
	delay : 0,
	defaultMaxTime : 120000,
	maxTime : 120000,

	setDelay : function(ms) {
		this.delay = ms;
	},
	setMaxTime : function(ms) {
		this.maxTime = ms ? ms : this.defaultMaxTime;
	},
	_arrayCount : function( arr, workspacePath) {
		// return all for testing.
		var self = this;
		if( !workspacePath) {
			var ret = 0;
			Object.keys(arr).forEach(function(key) {
				ret += self._arrayCount(arr, key);
			});
			return ret;
		};
		if( arr[workspacePath] && arr[workspacePath].length) {
			return arr[workspacePath].length;
		};
		return 0;
	},
	defferedRequestCount : function( workspacePath) {
		return this._arrayCount( Request.prototype.deferredReqs, workspacePath);
	},
	currentRequestCount : function( workspacePath) {
		return this._arrayCount( Request.prototype.currentReqs, workspacePath);
	},
	hasOutstandingRequests : function(workspacePath) {
		var total = this.defferedRequestCount(workspacePath) +	this.currentRequestCount(workspacePath);
		return total > 0;
	}
};
var instrumentation_1 = server$1.instrumentation = instrumentation;

var closeWorkspace = server$1.closeWorkspace = function(uid, folder, callback) {
	var r = new Request();
	r.initInternalClose(uid, folder, callback);
	r.execute();
};

/**
 *  Copyright (c) 2019, 2021, Texas Instruments Incorporated
 *  All rights reserved.
 *
 *   Redistribution and use in source and binary forms, with or without
 *   modification, are permitted provided that the following conditions
 *   are met:
 *
 *      Redistributions of source code must retain the above copyright
 *  notice, this list of conditions and the following disclaimer.
 *  notice, this list of conditions and the following disclaimer in the
 *  documentation and/or other materials provided with the distribution.
 *      Neither the name of Texas Instruments Incorporated nor the names of
 *  its contributors may be used to endorse or promote products derived
 *  from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 *  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 *  THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 *  PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 *  CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 *  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 *  OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
 *  OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 *  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 *  Original Author:
 *      Patrick Chuong, Texas Instruments, Inc.
 */
/**
 * An abstract class of the service provider.
 */
class AbstractServiceProvider {
    /**
     * Returns the workspace service.
     *
     * @param uid the user ID
     */
    getWorkspace(uid) {
        return this.getService({ role: 'workspaceserver', type: 'applicationPerUser', uid: uid });
    }
    /**
     * Returns the components service.
     */
    getComponents() {
        return this.getService({ role: 'components', type: 'application' });
    }
    /**
     * Returns the Gallery service.
     */
    getGallery() {
        return this.getService({ role: 'gallery', type: 'application' });
    }
    getGUIComposer() {
        return this.getService({ role: 'gc', type: 'application' });
    }
}

/**
 *  Copyright (c) 2019, 2024 Texas Instruments Incorporated
 *  All rights reserved.
 *
 *   Redistribution and use in source and binary forms, with or without
 *   modification, are permitted provided that the following conditions
 *   are met:
 *
 *      Redistributions of source code must retain the above copyright
 *  notice, this list of conditions and the following disclaimer.
 *  notice, this list of conditions and the following disclaimer in the
 *  documentation and/or other materials provided with the distribution.
 *      Neither the name of Texas Instruments Incorporated nor the names of
 *  its contributors may be used to endorse or promote products derived
 *  from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 *  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 *  THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 *  PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 *  CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 *  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 *  OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
 *  OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 *  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 *  Original Author:
 *      Patrick Chuong, Texas Instruments, Inc.
 */
/**
 * supported launcher.json parameters
 */
/**
 * Splash screen
 */
if (isNW && !/^darwin/.test(process.platform)) {
    (async () => {
        const cleanup = async () => {
            const profilePath = getProfilePath('GUI Composer Splash' /* app/splash/package.json name property */);
            await fs__default["default"].remove(profilePath);
        };
        const splashProcess = await open__default["default"]('', { app: [convertToAbsolutePath(BROWSER, __dirname), path__default["default"].join(__dirname, 'splash')] });
        splashProcess.on('exit', cleanup.bind(null));
        splashProcess.on('SIGINT', cleanup.bind(null));
        splashProcess.on('SIGUSR1', cleanup.bind(null));
        splashProcess.on('SIGUSR2', cleanup.bind(null));
        splashProcess.on('uncaughtException', cleanup.bind(null));
    })();
}
class ApplicationServiceProvider extends AbstractServiceProvider {
    constructor(ws, gc) {
        super();
        this.ws = ws;
        this.gc = gc;
        this.null = { host: '0.0.0.0', port: 0 };
    }
    async getService(options) {
        switch (options.role) {
            case 'workspaceserver':
                return this.ws;
            case 'gc':
                return this.gc;
        }
        return this.null;
    }
}
class ApplicationServer extends AbstractServer {
    constructor() {
        super(localhost);
    }
    async initializeServices() {
        /* start workspace server */
        const wsPort = await this.startWorkspaceServer();
        /* initialize controller */
        this.serviceProvider = new ApplicationServiceProvider({ host: localhost, port: wsPort }, { host: localhost, port: this.port });
        this.controller = new ApplicationController(this.serviceProvider, {
            isOnline: false,
        }, this.logger);
        return this.controller;
    }
    async onListening(port) {
        if (!BROWSER) {
            return port; // headless, no browser.  Used for running UI selenium tests.
        }
        const url = `http://${localhost}:${port}`;
        console.log(`Launching browser ${BROWSER} @ ${url}`);
        if (isNW) {
            /* read the package.json and create a temp folder using the app name */
            const packageJson = await fs__default["default"].readJson(path__default["default"].join(__dirname, 'package.json'));
            let projectJson = {};
            try {
                projectJson = await fs__default["default"].readJson(path__default["default"].join(__dirname, 'project.json'));
            }
            catch (e) {
                console.log('Warning: missing project.json file');
            }
            const appName = (projectJson.projectName || packageJson.name).replace(/\s+/g, '_');
            const tmpDir = await fs__default["default"].mkdtemp(path__default["default"].join(os__default["default"].tmpdir(), appName + '_'));
            /* set the url include the port number */
            packageJson.main = url;
            /* copy the icon file - nw.exe require it to be relative to the package.json */
            if (packageJson.window && projectJson.windowIcon) {
                const legacyWindowIconPath = path__default["default"].join(__dirname, 'images', projectJson.windowIcon); // legacy project with images folder
                const srcIconPath = fs__default["default"].existsSync(legacyWindowIconPath) ? legacyWindowIconPath : path__default["default"].join(__dirname, 'assets', projectJson.windowIcon);
                const destIconPath = path__default["default"].join(tmpDir, 'assets', projectJson.windowIcon);
                await fs__default["default"].mkdirp(path__default["default"].dirname(destIconPath));
                fs__default["default"].createReadStream(srcIconPath).pipe(fs__default["default"].createWriteStream(destIconPath));
                packageJson.window.icon = 'assets/' + projectJson.windowIcon;
            }
            /* write the package.json to the temp folder */
            await fs__default["default"].writeFile(path__default["default"].join(tmpDir, 'package.json'), JSON.stringify(packageJson, undefined, 2));
            /* clean up temp folder and terminate process */
            const cleanup = async () => {
                await fs__default["default"].remove(tmpDir);
                await fs__default["default"].remove(path__default["default"].join(getProfilePath(packageJson.name), os.platform() === 'win32' ? 'User Data' : '', 'Default', 'Web Data'));
                this.controller.shutdown(0);
            };
            process.on('exit', cleanup.bind(null));
            process.on('SIGINT', cleanup.bind(null));
            process.on('SIGUSR1', cleanup.bind(null));
            process.on('SIGUSR2', cleanup.bind(null));
            process.on('uncaughtException', cleanup.bind(null));
            /* launch nw */
            await open__default["default"]('', { app: [convertToAbsolutePath(BROWSER, __dirname), tmpDir], wait: true });
            /* when nw or browser process exit, kill ourself */
            cleanup();
        }
        else {
            /* launch browser */
            await open__default["default"](url, { app: BROWSER, wait: true });
        }
    }
    async startWorkspaceServer() {
        return new Promise((resolve, reject) => {
            start(consoleLogger, {
                root: __dirname,
                isLocal: true,
                ports: {
                    queryAsync: async (options, callback) => {
                        if (this.serviceProvider) {
                            const service = await this.serviceProvider.getService(options);
                            callback([service]);
                        }
                        else {
                            return null;
                        }
                    }
                }
            }, (err, port) => {
                err ? reject(err.toString()) : resolve(port);
            });
        });
    }
}
const server = new ApplicationServer();
const port = server.listen();

exports.port = port;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXBwbGljYXRpb25TZXJ2ZXIuanMiLCJzb3VyY2VzIjpbIi9ob21lL3h0b3JvaWRlL2djLWRlc2lnbmVyLWNsb3VkL3NlcnZlci9zcmMvQWJzdHJhY3RTZXJ2ZXIudHMiLCIvaG9tZS94dG9yb2lkZS9nYy1kZXNpZ25lci1jbG91ZC9zZXJ2ZXIvc3JjL2xpYi9jb21wb25lbnQtc2hhcmVzL3NlcnZlci91dGlsL2ZpbGV1dGlscy5qcyIsIi9ob21lL3h0b3JvaWRlL2djLWRlc2lnbmVyLWNsb3VkL3NlcnZlci9zcmMvRGVwZW5kZW5jeVdhbGtlci50cyIsIi9ob21lL3h0b3JvaWRlL2djLWRlc2lnbmVyLWNsb3VkL3NlcnZlci9zcmMvdW5wYWNrZXIudHMiLCIvaG9tZS94dG9yb2lkZS9nYy1kZXNpZ25lci1jbG91ZC9zZXJ2ZXIvc3JjL1Jlc291cmNlSGFuZGxlci50cyIsIi9ob21lL3h0b3JvaWRlL2djLWRlc2lnbmVyLWNsb3VkL3NlcnZlci9zcmMvQWJzdHJhY3RDb250cm9sbGVyLnRzIiwiL2hvbWUveHRvcm9pZGUvZ2MtZGVzaWduZXItY2xvdWQvc2VydmVyL3NyYy9CYXNpY0NvbnRyb2xsZXIudHMiLCIvaG9tZS94dG9yb2lkZS9nYy1kZXNpZ25lci1jbG91ZC9zZXJ2ZXIvc3JjL1RhcmdldENvbmZpZy50cyIsIi9ob21lL3h0b3JvaWRlL2djLWRlc2lnbmVyLWNsb3VkL3NlcnZlci9zcmMvQXBwbGljYXRpb25Db250cm9sbGVyLnRzIiwiL2hvbWUveHRvcm9pZGUvZ2MtZGVzaWduZXItY2xvdWQvc2VydmVyL3NyYy9saWIvY29tcG9uZW50LXNoYXJlcy9zZXJ2ZXIvbmV0L2h0dHAuanMiLCIvaG9tZS94dG9yb2lkZS9nYy1kZXNpZ25lci1jbG91ZC9zZXJ2ZXIvc3JjL2xpYi9jb21wb25lbnQtc2hhcmVzL3NlcnZlci93b3Jrc3BhY2UvaGVscGVyLmpzIiwiL2hvbWUveHRvcm9pZGUvZ2MtZGVzaWduZXItY2xvdWQvc2VydmVyL3NyYy9saWIvY29tcG9uZW50LXNoYXJlcy9zZXJ2ZXIvd29ya3NwYWNlL2NvcHlyb3V0ZS5qcyIsIi9ob21lL3h0b3JvaWRlL2djLWRlc2lnbmVyLWNsb3VkL3NlcnZlci9zcmMvbGliL2NvbXBvbmVudC1zaGFyZXMvc2VydmVyL3dvcmtzcGFjZS9kZWxlZ2F0ZXMvY2NzLmpzIiwiL2hvbWUveHRvcm9pZGUvZ2MtZGVzaWduZXItY2xvdWQvc2VydmVyL3NyYy9saWIvY29tcG9uZW50LXNoYXJlcy9zZXJ2ZXIvd29ya3NwYWNlL3NlcnZlci5qcyIsIi9ob21lL3h0b3JvaWRlL2djLWRlc2lnbmVyLWNsb3VkL3NlcnZlci9zcmMvQWJzdHJhY3RTZXJ2aWNlUHJvdmlkZXIudHMiLCIvaG9tZS94dG9yb2lkZS9nYy1kZXNpZ25lci1jbG91ZC9zZXJ2ZXIvc3JjL0FwcGxpY2F0aW9uU2VydmVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbbnVsbCwiLyoqXG4gKiBAY29weXJpZ2h0IDIwMTQsIFRleGFzIEluc3RydW1lbnRzXG4gKiBAb3duZXIgZGFsZXhpZXZcbiAqIFxuICogL3V0aWwvZmlsZXV0aWxzLmpzXG4gKi9cblxuXG52YXIgZnMgPSByZXF1aXJlKFwiZnNcIik7XG52YXIgcGF0aCAgPSByZXF1aXJlKCdwYXRoJyk7XG52YXIgY2hpbGRfcHJvY2VzcyA9IHJlcXVpcmUoXCJjaGlsZF9wcm9jZXNzXCIpOyBcbnZhciBpc1dpbiA9IC9ed2luLy50ZXN0KHByb2Nlc3MucGxhdGZvcm0pO1xuXG52YXIgbWtkaXJTeW5jID0gZnVuY3Rpb24gKHBhdGgpIHtcblx0dHJ5IHtcblx0XHRmcy5ta2RpclN5bmMocGF0aCk7XG5cdH0gY2F0Y2goZSkge1xuXHRcdGlmICghKGUuY29kZSA9PSAnRUVYSVNUJyB8fCBlLmNvZGUgPT0gJ0VJU0RJUicpKSB0aHJvdyBlO1xuXHR9XG59O1xuXG4vKipcbiAqIEVuc3VyZSBhIGZvbGRlciBleGlzdHMuIFxuICogSWYgd29ya3MgZm9yIGJvdGggcmVsYXRpdmUgYW5kIGFic29sdXRlIGRpcnBhdGguXG4gKi9cbmV4cG9ydHMubWtkaXJTeW5jID0gZnVuY3Rpb24gKCBkaXJwYXRoKSB7XG5cdHZhciBkcml2ZUxldHRlciA9IFwiXCI7XG5cdHZhciBteVBhdGggPSBkaXJwYXRoO1xuXHRpZiAoaXNXaW4pIHtcblx0XHR2YXIgaW5kZXggPSBteVBhdGguaW5kZXhPZihcIjpcIik7XG5cdFx0aWYgKGluZGV4ID4gMCkge1xuXHRcdFx0ZHJpdmVMZXR0ZXIgPSBteVBhdGguc3Vic3RyaW5nKDAsIGluZGV4KzIpO1xuXHRcdFx0bXlQYXRoID0gbXlQYXRoLnN1YnN0cmluZyhpbmRleCsyKTtcblx0XHR9XG5cdH1cblx0XG5cdHZhciBwYXJ0cyA9IG15UGF0aC5zcGxpdChwYXRoLnNlcCk7XG5cdGZvciggdmFyIGkgPSAxOyBpIDw9IHBhcnRzLmxlbmd0aDsgaSsrICkge1xuXHRcdHZhciBjdXJyZW50UGF0aCA9IHBhdGguam9pbi5hcHBseShudWxsLCBwYXJ0cy5zbGljZSgwLCBpKSk7XG5cdFx0aWYoIGRpcnBhdGguaW5kZXhPZihwYXRoLnNlcCkgPT0gMCkge1xuXHRcdFx0aWYoIGkgPT0gMSkge1xuXHRcdFx0XHRjdXJyZW50UGF0aCA9IHBhdGguc2VwO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGN1cnJlbnRQYXRoID0gcGF0aC5zZXAgKyBjdXJyZW50UGF0aDtcblx0XHRcdH1cblx0XHR9XG5cdFx0bWtkaXJTeW5jKCBkcml2ZUxldHRlciArIGN1cnJlbnRQYXRoKTtcblx0fVxufTtcblxuLyoqXG4gKiBSZW1vdmUgZmlsZXMgYW5kIGRpcmVjdG9yaWVzIGZvciB0aGUgZ2l2ZW4gcGF0aC5cbiAqIFxuICogQHBhcmFtIGRpcnBhdGggdGhlIGRpcmVjdG9yeSBwYXRoXG4gKi9cbmV4cG9ydHMucm1kaXJTeW5jID0gZnVuY3Rpb24gcm1kaXJTeW5jKGRpcnBhdGgpIHtcblx0dmFyIGZpbGVzID0gW107XG5cdGlmIChmcy5leGlzdHNTeW5jKGRpcnBhdGgpKSB7XG5cdFx0ZmlsZXMgPSBmcy5yZWFkZGlyU3luYyhkaXJwYXRoKTtcblx0XHRmaWxlcy5mb3JFYWNoKGZ1bmN0aW9uKGZpbGUsIGluZGV4KXtcblx0XHRcdHZhciBjdXJQYXRoID0gZGlycGF0aCArIFwiL1wiICsgZmlsZTtcblx0XHRcdGlmIChmcy5sc3RhdFN5bmMoY3VyUGF0aCkuaXNEaXJlY3RvcnkoKSkgeyAvLyByZWN1cnNlXG5cdFx0XHRcdHJtZGlyU3luYyhjdXJQYXRoKTtcblx0XHRcdH0gZWxzZSB7IC8vIGRlbGV0ZSBmaWxlXG5cdFx0XHRcdGZzLnVubGlua1N5bmMoY3VyUGF0aCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0XG5cdFx0LyogV09SS0FST1VORDogc29tZXRpbWUgcm1kaXJTeW5jIGZhaWxlZCBkdWUgdG8gdW5saW55U3luYyBkaWRuJ3QgZmluaXNoIHJlbW92aW5nIHRoZSBmaWxlcyBmcm9tIGRpc2sgKi9cblx0XHR2YXIgcmV0cnkgPSB0cnVlO1xuXHRcdGZvciAodmFyIGkgPSAwOyByZXRyeSAmJiAoaSA8IDIwKTsgKytpKSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRmcy5ybWRpclN5bmMoZGlycGF0aCk7XG5cdFx0XHRcdHJldHJ5ID0gZmFsc2U7XG5cdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdHJldHJ5ID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG4gICAgfVxufTtcblxuXG4vKipcbiAqIFJldHVybnMgcmFuZG9tIGdlbmVyYXRlZCBmaWxlIG5hbWUgdGhhdCBkb2VzIG5vdCBleGlzdCBpbiB0aGUgc3BlY2lmaWVkIGZvbGRlci4gXG4gKiBAcGFyYW0gZm9sZGVyIFxuICogQHBhcmFtIGNhbGxiYWNrKCBlcnJvciwgZmlsZVBhdGgpIC0gdGhlIGZ1bGwgcGF0aCBvZiB0aGUgZmlsZS4gIFxuICovXG5leHBvcnRzLmdldFRlbXBGaWxlID0gZnVuY3Rpb24gZ2V0VGVtcEZpbGVOYW1lKCBmb2xkZXIsIGNhbGxiYWNrKSB7XG5cdHZhciBfZ2V0RmlsZU5hbWUgPSBmdW5jdGlvbiggbGV2ZWwpIHtcblx0XHRpZiggbGV2ZWwgPj0gMjApIHtcblx0XHRcdGNhbGxiYWNrKG5ldyBFcnJvcihcIkNhbm5vdCBjcmVhdGUgdGVtcCBmaWxlLlwiKSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fTtcblx0XHR2YXIgZGVzdCA9IE1hdGguZmxvb3IoKE1hdGgucmFuZG9tKCkgKiAxMEU4KSArIDEpO1xuXHRcdHZhciBuYW1lID0gZGVzdC50b1N0cmluZygpICsgXCIudG1wXCI7XG5cdFx0dmFyIGZ1bGxQYXRoID0gcGF0aC5qb2luKGZvbGRlciwgbmFtZSk7XG5cdFx0ZnMuZXhpc3RzKCBmdWxsUGF0aCwgZnVuY3Rpb24gKGV4aXN0cykge1xuXHRcdFx0aWYoIGV4aXN0cykge1xuXHRcdFx0XHRfZ2V0RmlsZU5hbWUoIGxldmVsICsgMSk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHQgICAgY2FsbGJhY2soIHVuZGVmaW5lZCwgZnVsbFBhdGgpO1xuXHRcdH0pO1xuXHR9O1xuXHRfZ2V0RmlsZU5hbWUoMCk7XG59O1xuXG5cbi8vIGFzc3VtZXMgZm9sZGVyIGlzIGEgZm9sZGVyLlxuLy8gY2FsbGJhY2soIGVycm9yLCBmaWxlcywgZm9sZGVycylcbmZ1bmN0aW9uIGxpc3RGaWxlc0FuZEZvbGRlcnMoIGZvbGRlciwgY2FsbGJhY2spIHtcblx0ZnMucmVhZGRpciggZm9sZGVyLCBmdW5jdGlvbiggZXJyb3IsIGl0ZW1zKSB7XG5cdFx0dmFyIGZpbGVzID0gW107XG5cdFx0dmFyIGZvbGRlcnMgPSBbXTtcblx0XHRpZiggZXJyb3IgKSB7XG5cdFx0XHRyZXR1cm4gY2FsbGJhY2soZXJyb3IgLCBmaWxlcywgZm9sZGVycyk7XG5cdFx0fTtcblx0XHR2YXIgY291bnQgPSBpdGVtcy5sZW5ndGg7XG5cdFx0aWYoIGNvdW50ID09IDApIHtcblx0XHRcdHJldHVybiBjYWxsYmFjayh1bmRlZmluZWQsIGZpbGVzLCBmb2xkZXJzKTsgXG5cdFx0fTtcblx0XHR2YXIgZmlyc3RFcnJvcjtcblx0XHR2YXIgY3VycmVudCA9IDA7XG5cdFx0dmFyIHN0YXQgPSBmdW5jdGlvbiggZnVsbHBhdGgpIHtcblx0XHRcdGZzLnN0YXQoIGZ1bGxwYXRoLCBmdW5jdGlvbiggZXJyb3IyLCBzdCkge1xuXHRcdFx0XHRpZiggZXJyb3IyICYmICFmaXJzdEVycm9yKSB7XG5cdFx0XHRcdFx0Zmlyc3RFcnJvciA9IGVycm9yMjtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmKCBlcnJvcjIpIHtcblx0XHRcdFx0XHQvLyBETyBOT1RISU5HLiBXZSByZWNvcmRlZCB0aGUgZmlyc3QgZXJyb3IuXG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSBpZiggc3QuaXNGaWxlKCkpIHtcblx0XHRcdFx0XHRmaWxlcy5wdXNoKGZ1bGxwYXRoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmKCBzdC5pc0RpcmVjdG9yeSgpKSB7XG5cdFx0XHRcdFx0Zm9sZGVycy5wdXNoKGZ1bGxwYXRoKTtcblx0XHRcdFx0fTtcblx0XHRcdFx0KytjdXJyZW50O1xuXHRcdFx0XHRpZiggY3VycmVudCA9PSBjb3VudCkge1xuXHRcdFx0XHRcdGNhbGxiYWNrKCBmaXJzdEVycm9yLCBmaWxlcywgZm9sZGVycyk7XG5cdFx0XHRcdH07XG5cdFx0XHR9KTtcdFx0XG5cdFx0fTtcblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgY291bnQ7ICsraSkge1xuXHRcdFx0c3RhdCggcGF0aC5qb2luKCBmb2xkZXIsIGl0ZW1zW2ldKSk7XG5cdFx0fTtcblx0fSk7XHRcbn07XG5leHBvcnRzLmxpc3RGaWxlc0FuZEZvbGRlcnMgPSBsaXN0RmlsZXNBbmRGb2xkZXJzOyBcblxuLy8gYXNzdW1lcyBmaWxlcyBpcyBhcnJheSBvZiBmdWxsIHBhdGggbmFtZXMgdG8gZmlsZXMuIFxuZnVuY3Rpb24gZGVsZXRlQWxsRmlsZXMoIGZpbGVzLCBjYWxsYmFjaykge1xuXHR2YXIgY291bnQgPSBmaWxlcy5sZW5ndGg7XG5cdGlmKCBjb3VudCA9PSAwKSB7XG5cdFx0cmV0dXJuIGNhbGxiYWNrKCk7XG5cdH07XG5cdHZhciBmaXJzdEVycm9yO1xuXHR2YXIgY3VycmVudCA9IDA7XG5cdGZvciggdmFyIGkgPSAwOyBpIDwgY291bnQ7ICsraSkge1xuXHRcdGZzLnVubGluayggZmlsZXNbaV0sIGZ1bmN0aW9uKCBlcnJvcikge1xuXHRcdFx0aWYoIGVycm9yICYmICFmaXJzdEVycm9yKSB7XG5cdFx0XHRcdGZpcnN0RXJyb3IgPSBlcnJvcjtcblx0XHRcdH07XG5cdFx0XHQrK2N1cnJlbnQ7XG5cdFx0XHRpZiggY3VycmVudCA9PSBjb3VudCkge1xuXHRcdFx0XHRjYWxsYmFjayggZmlyc3RFcnJvcik7XG5cdFx0XHR9O1xuXHRcdH0pO1xuXHR9O1xufTtcblxuLy9hc3N1bWVzIGZvbGRlcnMgaXMgYXJyYXkgb2YgZnVsbCBwYXRoIG5hbWVzIHRvIGV4aXN0aW5nIGZvbGRlcnMuIFxuZnVuY3Rpb24gZGVsZXRlQWxsRm9sZGVycyggZm9sZGVycywgY2FsbGJhY2spIHtcblx0dmFyIGNvdW50ID0gZm9sZGVycy5sZW5ndGg7XG5cdGlmKCBjb3VudCA9PSAwKSB7XG5cdFx0cmV0dXJuIGNhbGxiYWNrKCk7XG5cdH07XG5cdHZhciBmaXJzdEVycm9yO1xuXHR2YXIgY3VycmVudCA9IDA7XG5cdHZhciBlbXB0eUFuZFJlbW92ZUZvbGRlciA9IGZ1bmN0aW9uKCBmdWxscGF0aCkge1xuXHRcdGVtcHR5Rm9sZGVyKCBmdWxscGF0aCwgZnVuY3Rpb24oIGVycm9yKSB7XG5cdFx0XHRpZiggZXJyb3IpIHtcblx0XHRcdFx0Ly8gaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlLXYwLngtYXJjaGl2ZS9pc3N1ZXMvMjM4N1xuXHRcdFx0XHRpZiggZXJyb3IgJiYgZXJyb3IuY29kZSA9PSBcIkVOT0VOVFwiICYmIGVycm9yLnBhdGggJiYgIWlzV2luKSB7XG5cdFx0XHRcdFx0Y2hpbGRfcHJvY2Vzcy5leGVjKFwicm0gLXJmIFwiICsgZnVsbHBhdGgsIGZ1bmN0aW9uKCBlcnIpIHtcblx0XHRcdFx0XHRcdCsrY3VycmVudDtcblx0XHRcdFx0XHRcdGlmKCBjdXJyZW50ID09IGNvdW50KSB7XG5cdFx0XHRcdFx0XHRcdGNhbGxiYWNrKCBmaXJzdEVycm9yKTtcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9O1xuXHRcdFx0XHRpZiggIWZpcnN0RXJyb3IpIHtcblx0XHRcdFx0XHRmaXJzdEVycm9yID0gZXJyb3I7XG5cdFx0XHRcdH07XG5cdFx0XHRcdCsrY3VycmVudDtcblx0XHRcdFx0aWYoIGN1cnJlbnQgPT0gY291bnQpIHtcblx0XHRcdFx0XHRjYWxsYmFjayggZmlyc3RFcnJvcik7XG5cdFx0XHRcdH07XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH07XG5cdFx0XHRmcy5ybWRpcihmdWxscGF0aCwgZnVuY3Rpb24oIGVycm9yMil7XG5cdFx0XHRcdGlmKCBlcnJvcjIgJiYgIWZpcnN0RXJyb3IpIHtcblx0XHRcdFx0XHRmaXJzdEVycm9yID0gZXJyb3IyOyBcblx0XHRcdFx0fVxuXHRcdFx0XHQrK2N1cnJlbnQ7XG5cdFx0XHRcdGlmKCBjdXJyZW50ID09IGNvdW50KSB7XG5cdFx0XHRcdFx0Y2FsbGJhY2soIGZpcnN0RXJyb3IpO1xuXHRcdFx0XHR9O1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH07XG5cdFxuXHRmb3IoIHZhciBpID0gMDsgaSA8IGNvdW50OyArK2kpIHtcblx0XHRlbXB0eUFuZFJlbW92ZUZvbGRlciggZm9sZGVyc1tpXSk7XG5cdH07XG59XG5cblxuLy8gYXNzdW1lcyB3ZSBoYXZlIHdyaXRlIHBlcm1pc3Npb24gZm9yIGVhY2ggZWxlbWVudC5cbi8vIGFzc3VtZXMgZm9sZGVyIGlzIGZvbGRlciBhbmQgaXQgZXhpc3RzLiBcbmZ1bmN0aW9uIGVtcHR5Rm9sZGVyKCBmb2xkZXIsIGNhbGxiYWNrKSB7XG5cdGxpc3RGaWxlc0FuZEZvbGRlcnMoIGZvbGRlciwgZnVuY3Rpb24oIGVycm9yLCBmaWxlcywgZm9sZGVycykge1xuXHRcdGlmKCBlcnJvcikge1xuXHRcdFx0cmV0dXJuIGNhbGxiYWNrKCBlcnJvcik7XG5cdFx0fTtcblx0XHRkZWxldGVBbGxGaWxlcyggZmlsZXMsIGZ1bmN0aW9uKCBlcnJvcjIpIHtcblx0XHRcdGlmKCBlcnJvcjIpIHtcblx0XHRcdFx0cmV0dXJuIGNhbGxiYWNrKCBlcnJvcjIpO1xuXHRcdFx0fTtcblx0XHRcdGRlbGV0ZUFsbEZvbGRlcnMoIGZvbGRlcnMsIGNhbGxiYWNrKTtcblx0XHR9KTtcblx0fSk7XG59O1xuXG4vKipcbiAqIElmIGZ1bGxwYXRoIGRvZXMgbm90IGV4aXN0LCBpdCBjcmVhdGVzIGl0LiBcbiAqIElmIGZ1bGxwYXRoIGlzIGEgZm9sZGVyLCBpdCBlbXB0aWVzIGl0LlxuICogSWYgZnVsbHBhdGggaXMgYSBmaWxlLCBkZWxldGVzIGlzIGFuZCBjcmVhdGVzIGEgZm9sZGVyIHdpdGggdGhlIHNhbWUgbmFtZSBpbnN0ZWFkLiBcbiAqL1xuZXhwb3J0cy5lbXB0eURpcmVjdG9yeSA9IGZ1bmN0aW9uKGZ1bGxwYXRoLCBjYWxsYmFjayl7XG5cdGZzLmV4aXN0cyggZnVsbHBhdGgsIGZ1bmN0aW9uKGV4aXN0cyl7XG5cdFx0aWYoICFleGlzdHMpIHtcblx0XHRcdGV4cG9ydHMubWtkaXJTeW5jKCBmdWxscGF0aCk7XG5cdFx0XHRyZXR1cm4gY2FsbGJhY2soKTtcblx0XHR9XG5cdFx0ZnMuc3RhdCggZnVsbHBhdGgsIGZ1bmN0aW9uKGVycm9yLCBzdCkge1xuXHRcdFx0aWYoIGVycm9yKSB7XG5cdFx0XHRcdHJldHVybiBjYWxsYmFjayggZXJyb3IpO1xuXHRcdFx0fTtcblx0XHRcdGlmKCBzdC5pc0ZpbGUoKSkge1xuXHRcdFx0XHRkZWxldGVBbGxGaWxlcyggW2Z1bGxwYXRoXSwgZnVuY3Rpb24oZXJyb3IyKSB7XG5cdFx0XHRcdFx0ZXhwb3J0cy5lbXB0eURpcmVjdG9yeSggZnVsbHBhdGgsIGNhbGxiYWNrKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmKCBzdC5pc0RpcmVjdG9yeSgpKSB7XG5cdFx0XHRcdGVtcHR5Rm9sZGVyKCBmdWxscGF0aCwgZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0XHRcdGlmKCBlcnJvciAmJiBlcnJvci5jb2RlID09IFwiRU5PRU5UXCIgJiYgZXJyb3IucGF0aCAgJiYgIWlzV2luKSB7XG5cdFx0XHRcdFx0XHQvLyBodHRwczovL2dpdGh1Yi5jb20vbm9kZWpzL25vZGUtdjAueC1hcmNoaXZlL2lzc3Vlcy8yMzg3XG5cdFx0XHRcdFx0XHRjaGlsZF9wcm9jZXNzLmV4ZWMoXCJybSAtcmYgXCIgKyBmdWxscGF0aCwgZnVuY3Rpb24oIGVycikge1xuXHRcdFx0XHRcdFx0XHRjYWxsYmFjaygpO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRjYWxsYmFjayhlcnJvcik7XHRcdFxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRjYWxsYmFjayhuZXcgRXJyb3IoXCJVbnN1cHBvcnRlZCBGaWxlIFR5cGU6IHBhdGg9XCIrZnVsbHBhdGgpKTtcblx0XHRcdH07XG5cdFx0fSk7XG5cdH0pO1xufTtcblxuLyoqXG4gKiBJZiBmdWxscGF0aCBkb2VzIG5vdCBleGlzdCwgaXQgZG9lcyBub3RoaW5nLiBcbiAqIElmIGZ1bGxwYXRoIGlzIGEgZm9sZGVyIG9yIGEgZmlsZSwgaXQgcmVtb3ZlcyBpdC5cbiAqL1xuZXhwb3J0cy5yZW1vdmVJdGVtID0gZnVuY3Rpb24oIGZ1bGxwYXRoLCBjYWxsYmFjaykge1xuXHRmcy5leGlzdHMoIGZ1bGxwYXRoLCBmdW5jdGlvbihleGlzdHMpe1xuXHRcdGlmKCAhZXhpc3RzKSB7XG5cdFx0XHRyZXR1cm4gY2FsbGJhY2soKTtcblx0XHR9XG5cdFx0ZnMuc3RhdCggZnVsbHBhdGgsIGZ1bmN0aW9uKGVycm9yLCBzdCkge1xuXHRcdFx0aWYoIGVycm9yKSB7XG5cdFx0XHRcdHJldHVybiBjYWxsYmFjayggZXJyb3IpO1xuXHRcdFx0fTtcblx0XHRcdGlmKCBzdC5pc0ZpbGUoKSkge1xuXHRcdFx0XHRyZXR1cm4gZGVsZXRlQWxsRmlsZXMoIFtmdWxscGF0aF0sIGNhbGxiYWNrKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYoIHN0LmlzRGlyZWN0b3J5KCkpIHtcblx0XHRcdFx0ZXhwb3J0cy5lbXB0eURpcmVjdG9yeSggZnVsbHBhdGgsIGZ1bmN0aW9uKCBlcnJvcikge1xuXHRcdFx0XHRcdGlmKCBlcnJvcikge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGNhbGxiYWNrKGVycm9yKTtcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdHJldHVybiBkZWxldGVBbGxGb2xkZXJzKCBbZnVsbHBhdGhdLCBjYWxsYmFjayk7IFxuXHRcdFx0XHR9KTtcdFx0XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0Y2FsbGJhY2sobmV3IEVycm9yKFwiVW5zdXBwb3J0ZWQgRmlsZSBUeXBlOiBwYXRoPVwiK2Z1bGxwYXRoKSk7XG5cdFx0XHR9O1xuXHRcdH0pO1xuXHR9KTtcbn07XG5cbmV4cG9ydHMubW92ZUl0ZW0gPSBmdW5jdGlvbihvbGRQYXRoLCBuZXdQYXRoLCBjYWxsYmFjaykge1xuICAgIGZzLnJlbmFtZShvbGRQYXRoLCBuZXdQYXRoLCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIGlmIChlcnIuY29kZSA9PT0gJ0VYREVWJykge1xuICAgICAgICAgICAgICAgIGNvcHkoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjYWxsYmFjaygpO1xuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gY29weSAoKSB7XG4gICAgICAgIHZhciByZWFkU3RyZWFtID0gZnMuY3JlYXRlUmVhZFN0cmVhbShvbGRQYXRoKTtcbiAgICAgICAgdmFyIHdyaXRlU3RyZWFtID0gZnMuY3JlYXRlV3JpdGVTdHJlYW0obmV3UGF0aCk7XG5cbiAgICAgICAgcmVhZFN0cmVhbS5vbignZXJyb3InLCBjYWxsYmFjayk7XG4gICAgICAgIHdyaXRlU3RyZWFtLm9uKCdlcnJvcicsIGNhbGxiYWNrKTtcbiAgICAgICAgcmVhZFN0cmVhbS5vbignY2xvc2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmcy51bmxpbmsob2xkUGF0aCwgY2FsbGJhY2spO1xuICAgICAgICB9KTtcblxuICAgICAgICByZWFkU3RyZWFtLnBpcGUod3JpdGVTdHJlYW0pO1xuICAgIH1cbn07XG5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlanMvbm9kZS12MC54LWFyY2hpdmUvaXNzdWVzLzIzODdcbmV4cG9ydHMuY292ZXJ0RmlsZU5hbWVzVG9VVEY4ID0gZnVuY3Rpb24gKCBmb2xkZXIsIGNhbGxiYWNrKSB7XG5cdGlmKCBpc1dpbikge1xuXHRcdGNhbGxiYWNrKCk7XG5cdFx0cmV0dXJuO1xuXHR9O1xuXHRsaXN0RmlsZXNBbmRGb2xkZXJzKCBmb2xkZXIsIGZ1bmN0aW9uKCBlcnJvcikge1xuXHRcdGlmKCBlcnJvciAmJiBlcnJvci5jb2RlID09IFwiRU5PRU5UXCIgJiYgZXJyb3IucGF0aCkge1xuXHRcdFx0Y2hpbGRfcHJvY2Vzcy5leGVjKFwiY29udm12IC0tbm90ZXN0IC1yIC1mIGlzby04ODU5LTEgLXQgVVRGLTggXCIgKyBmb2xkZXIsIGZ1bmN0aW9uKCBlcnIpIHtcblx0XHRcdFx0Y2FsbGJhY2soeyBjb252ZXJ0ZWQgOiB0cnVlfSk7XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybjtcblx0XHR9O1xuXHRcdGNhbGxiYWNrKCk7XG5cdH0pO1x0XG59O1xuXG5leHBvcnRzLmZpbGVuYW1lV2l0aERhdGUgPSBmdW5jdGlvbihmaWxlbmFtZSkge1xuXHRmdW5jdGlvbiBfcGFkKG51bSwgc2l6ZSkge1xuXHRcdHZhciBzID0gbnVtICsgJyc7XG5cdFx0d2hpbGUgKHMubGVuZ3RoIDwgc2l6ZSkgcyA9ICcwJyArIHM7XG5cdFx0cmV0dXJuIHM7XG5cdH1cblx0XG5cdHZhciBkYXRlID0gbmV3IERhdGUoKTtcblx0cmV0dXJuIGZpbGVuYW1lICsgXCJfXCJcblx0XHQrIF9wYWQoZGF0ZS5nZXRVVENGdWxsWWVhcigpLCA0KS50b1N0cmluZygpIFxuXHRcdCsgX3BhZChkYXRlLmdldFVUQ01vbnRoKCkrMSwgMikudG9TdHJpbmcoKSAvLyBtb250aCBpbiBKUyBpcyB6ZXJvIGJhc2Vcblx0XHQrIF9wYWQoZGF0ZS5nZXRVVENEYXRlKCksIDIpLnRvU3RyaW5nKClcblx0XHQrIF9wYWQoZGF0ZS5nZXRVVENIb3VycygpLCAyKS50b1N0cmluZygpXG5cdFx0KyBfcGFkKGRhdGUuZ2V0VVRDTWludXRlcygpLCAyKS50b1N0cmluZygpXG5cdFx0KyBfcGFkKGRhdGUuZ2V0VVRDU2Vjb25kcygpLCAyKS50b1N0cmluZygpOyBcbn07XG5cbmV4cG9ydHMuZW5jb2RlUGF0aFNlZ21lbnRzID0gZnVuY3Rpb24ocGF0aCkge1xuXHR2YXIgcmVzdWx0ID0gW107XG5cdHZhciBzZWdtZW50cyA9IHBhdGguc3BsaXQoXCIvXCIpO1xuXHRzZWdtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKHNlZ21lbnQpIHtcblx0XHRyZXN1bHQucHVzaChlbmNvZGVVUklDb21wb25lbnQoc2VnbWVudCkpO1xuXHR9KTtcblx0cmV0dXJuIHJlc3VsdC5qb2luKFwiL1wiKTtcbn07IixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLCIvKipcbiAqIFRyaWVzIHRvIGZpbmQgYW4gYXZhaWxhYmxlIHBvcnQgZm9yIHRoZSBzZXJ2ZXIgdG8gc3RhcnQgbGlzdGVuaW5nIHRvLlxuICogc3RhcnRzIHdpdGggYSByYW5kb20gbnVtYmVyIGFuZCBvZiB0aGUgcG9ydHMgaXMgaW4gdXNlLCB0cmllcyB0aGUgbmV4dC5cbiAqIHVudGlsIGl0IGV4aGF1c3QgYWxsIG51bWJlcnMgYmV0d2VlbiAxMDAwMCBhbmQgNjUwMDAuXG4gKiAgXG4gKiBAcGFyYW0gc2VydmVyIC0gYW4gSFRUUCBzZXJ2ZXIuIFxuICogQHBhcmFtIGNhbGxiYWNrIChlcnJvciwgcG9ydCkgIFxuICovXG5leHBvcnRzLmZpbmRQb3J0QW5kTGlzdGVuID0gZnVuY3Rpb24oIHNlcnZlciwgY2FsbGJhY2spIHtcblx0dmFyIG1pbiA9IDEwMDAwO1xuXHR2YXIgbWF4ID0gNTUwMDA7XG5cdHZhciBzdGFydCA9IG1pbiArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIG1heCk7XG5cdHZhciBjdXJyZW50ID0gc3RhcnQgKyAxOyBcblx0XG5cdGZ1bmN0aW9uIGdldE5leHQoIGN1cnJlbnQpIHtcblx0XHQvLyByb2xsIG92ZXIuIFdlIGRpZCBub3QgZmluZCBhIHNpbmdsZSBwb3J0LiBcblx0XHRpZiggY3VycmVudCA9PT0gc3RhcnQpIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblx0XHRpZiggY3VycmVudCA8IG1heCkge1xuXHRcdFx0cmV0dXJuIGN1cnJlbnQgKyAxO1xuXHRcdH1cblx0XHRyZXR1cm4gbWluO1xuXHR9XG5cdFxuXHRmdW5jdGlvbiBsaXN0ZW5IVFRQaW5uZXIoIGN1cnJlbnQpIHtcblx0XHR2YXIgb25FcnJvciA9IGZ1bmN0aW9uKGVycil7XG5cdFx0XHRzZXJ2ZXIucmVtb3ZlTGlzdGVuZXIoIFwiZXJyb3JcIiwgb25FcnJvcik7XG5cdFx0XHRzZXJ2ZXIucmVtb3ZlTGlzdGVuZXIoIFwibGlzdGVuaW5nXCIsIG9uTGlzdGVuaW5nKTtcblx0XHRcdGlmKCBlcnIuY29kZSA9PT0gJ0VBRERSSU5VU0UnKSB7XG5cdFx0XHRcdHZhciBuZXh0ID0gZ2V0TmV4dChjdXJyZW50KTtcblx0XHRcdFx0aWYoIG5leHQgIT09IG51bGwpIHsgXG5cdFx0XHRcdFx0bGlzdGVuSFRUUGlubmVyKCBuZXh0KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRjYWxsYmFjayggbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgYXZhaWFibGUgcG9ydC5cIikpO1xuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGNhbGxiYWNrKCBlcnIpO1xuXHRcdFx0fTtcblx0XHR9O1xuXHRcdHZhciBvbkxpc3RlbmluZyA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0c2VydmVyLnJlbW92ZUxpc3RlbmVyKCBcImVycm9yXCIsIG9uRXJyb3IpO1xuXHRcdFx0c2VydmVyLnJlbW92ZUxpc3RlbmVyKCBcImxpc3RlbmluZ1wiLCBvbkxpc3RlbmluZyk7XG5cdFx0XHRyZXR1cm4gY2FsbGJhY2soIG51bGwsIGN1cnJlbnQpO1xuXHRcdH07XG5cdFx0c2VydmVyLm9uY2UoXCJlcnJvclwiLCBvbkVycm9yKTtcblx0XHRzZXJ2ZXIub25jZShcImxpc3RlbmluZ1wiLCBvbkxpc3RlbmluZyk7XG5cdFx0c2VydmVyLmxpc3RlbiggY3VycmVudCk7XG5cdH1cblx0XG5cdGxpc3RlbkhUVFBpbm5lciggY3VycmVudCk7XG59OyIsIi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBcbiAqIEBjb3B5cmlnaHQgMjAxNSBUZXhhcyBJbnN0cnVtZW50c1xuICogQG93bmVyIGRhbGV4aWV2XG4gKiBcbiAqIEhlbHBlciBmdW5jdGlvbnMuICBcbiAqIFxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbmZ1bmN0aW9uIGVuZE9LKHJlcykgeyBcblx0cmVzLndyaXRlSGVhZCgyMDAsIHsnQ29udGVudC1UeXBlJzogJ3RleHQvanNvbid9KTtcblx0cmVzLmVuZChcIk9LXCIpO1xufTtcblxuZnVuY3Rpb24gZW5kRXJyb3IoIHJlcywgdGV4dCkge1xuXHRyZXMud3JpdGVIZWFkKDQwNCwgeydDb250ZW50LVR5cGUnOiAndGV4dC9qc29uJ30pO1xuXHRyZXMuZW5kKHRleHQpO1xufTtcblxuZnVuY3Rpb24gdmFsaWRQYXRoTmFtZSggcGFyYW0pIHtcblx0aWYoIHBhcmFtLmluZGV4T2YoXCIuLlwiKSAhPSAtMSlcblx0XHRyZXR1cm4gZmFsc2U7XG5cdHJldHVybiB0cnVlO1xufTtcblxuZnVuY3Rpb24gdmFsaWRGaWxlTmFtZSggcGFyYW0pIHtcblx0aWYoICF2YWxpZFBhdGhOYW1lKHBhcmFtKSlcblx0XHRyZXR1cm4gZmFsc2U7XG5cdGlmKCBwYXJhbS5pbmRleE9mKFwiL1wiKSAhPSAtMSlcblx0XHRyZXR1cm4gZmFsc2U7XG5cdGlmKCBwYXJhbS5pbmRleE9mKFwiXFxcXFwiKSAhPSAtMSkgXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHRyZXR1cm4gdHJ1ZTtcbn07XG5cbmV4cG9ydHMuZW5kT0sgPSBlbmRPSzsgXG5leHBvcnRzLmVuZEVycm9yID0gZW5kRXJyb3I7XG5leHBvcnRzLnZhbGlkUGF0aE5hbWUgPSB2YWxpZFBhdGhOYW1lO1xuZXhwb3J0cy52YWxpZEZpbGVOYW1lID0gdmFsaWRGaWxlTmFtZTtcbiIsIi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKlxuICogQGNvcHlyaWdodCAyMDE1IFRleGFzIEluc3RydW1lbnRzXG4gKiBAb3duZXIgZGFsZXhpZXZcbiAqXG4gKiBIZWxwZXIgdG8gaW1wbGVtZW50IGEgY29weSByb3V0ZS5cbiAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxudmFyIHVybFx0XHRcdD0gcmVxdWlyZShcInVybFwiKTtcbnZhciBmc1x0XHRcdD0gcmVxdWlyZShcImZzXCIpO1xudmFyIHBhdGhcdFx0PSByZXF1aXJlKFwicGF0aFwiKTtcbnZhciBodHRwXHRcdD0gcmVxdWlyZShcImh0dHBcIik7XG52YXIgcXVlcnlzdHJpbmcgPSByZXF1aXJlKFwicXVlcnlzdHJpbmdcIik7XG52YXIgdGFyIFx0XHQ9IHJlcXVpcmUoXCJ0YXItZnNcIik7XG52YXIgdGFyc3RyZWFtIFx0PSByZXF1aXJlKFwidGFyLXN0cmVhbVwiKTtcblxudmFyIGZpbGV1dGlsc1x0PSByZXF1aXJlKFwiLi4vdXRpbC9maWxldXRpbHMuanNcIik7XG52YXIgaGVscGVyIFx0XHQ9IHJlcXVpcmUoXCIuL2hlbHBlci5qc1wiKTtcblxuZnVuY3Rpb24gaW5pdFJlcXVlc3QoIHJlcywgcmVxdWVzdCkge1xuICAgIGlmKCByZXF1ZXN0KSB7XG4gICAgICAgIHJldHVybiByZXF1ZXN0O1xuICAgIH07XG4gICAgcmV0dXJuIHtcbiAgICAgICAgZW5kRXJyb3IgOiBmdW5jdGlvbiAobWVzc2FnZSkge1xuICAgICAgICAgICAgaGVscGVyLmVuZEVycm9yKHJlcywgbWVzc2FnZSk7XG4gICAgICAgIH0sXG4gICAgICAgIGVuZE9LIDogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGhlbHBlci5lbmRPSyhyZXMpO1xuICAgICAgICB9XG4gICAgfTtcbn07XG5cbi8vIGNvbnZlcnQgc3luY2ggdG8gYXN5bmMsIGdpdmUgcHJpb3JpdHkgdG8gdGhlIG5ldyBmdW5jdGlvbiBcbmZ1bmN0aW9uIHF1ZXJ5QXN5bmMoIHBvcnRzLCBhcHBEYXRhLCBjYWxsYmFjaykge1xuXHRpZiggcG9ydHMgJiYgcG9ydHMucXVlcnlBc3luYyAmJiB0eXBlb2YgcG9ydHMucXVlcnlBc3luYyA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0cmV0dXJuIHBvcnRzLnF1ZXJ5QXN5bmMoIGFwcERhdGEsIGNhbGxiYWNrKTsgXG5cdH1cblx0ZWxzZSBpZiggcG9ydHMgJiYgcG9ydHMucXVlcnkgJiYgdHlwZW9mIHBvcnRzLnF1ZXJ5ID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRyZXR1cm4gY2FsbGJhY2soIHBvcnRzLnF1ZXJ5KCBhcHBEYXRhKSk7XG5cdH1cblx0cmV0dXJuIGNhbGxiYWNrKG51bGwpO1xufVxuXG52YXIgSU5WQUxJRF9GUk9NX1BBUkFNID0gXCJJbnZhbGlkIGZyb20gcGFyYW1ldGVyLlwiO1xudmFyIElOVkFMSURfQVBQX1JFR0lTVFJZID0gXCJBcHBpY2F0aW9uIG5vdCBwcm9wZXJseSByZWdpc3RlcmVkLlwiO1xudmFyIENBTk5PVF9JREVOVElGWV9VU0VSID0gXCJDYW5ub3QgaWRlbnRpZnkgdGhlIHVzZXIuXCI7XG5cbmZ1bmN0aW9uIGdldFBhY2tEYXRhKCByZXEsIGZyb20sIG9wdGlvbnMsIGNvbW1hbmRJZCwgbm9yb290LCBjYWxsYmFjaykge1xuXHR2YXIgdWlkID0gbnVsbDtcbiAgICB2YXIgdXNlckluZm8gPSByZXEuaGVhZGVyc1tcInRpLXVzZXItaW5mb1wiXTtcbiAgICBpZiggIW9wdGlvbnMuaXNMb2NhbCkge1xuICAgICAgICBpZiggIXVzZXJJbmZvKSB7XG4gICAgICAgICAgICBjYWxsYmFjayggQ0FOTk9UX0lERU5USUZZX1VTRVIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9O1xuICAgICAgICB1aWQgPSBxdWVyeXN0cmluZy5wYXJzZSh1c2VySW5mbykudXNlcklkO1xuICAgICAgICBpZiggIXVpZCkge1xuICAgICAgICAgICAgY2FsbGJhY2soIENBTk5PVF9JREVOVElGWV9VU0VSKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgaWYoICFmcm9tKSB7XG4gICAgICAgIGNhbGxiYWNrKElOVkFMSURfRlJPTV9QQVJBTSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9O1xuICAgIGlmKCAhaGVscGVyLnZhbGlkUGF0aE5hbWUoZnJvbSkpIHtcbiAgICAgICAgY2FsbGJhY2soSU5WQUxJRF9GUk9NX1BBUkFNKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH07XG4gICAgdmFyIHRvUGFydHMgPSBmcm9tLnNwbGl0KFwiL1wiKTtcbiAgICBpZiggdG9QYXJ0cy5sZW5ndGggPCAzKSB7XG4gICAgICAgIGNhbGxiYWNrKElOVkFMSURfRlJPTV9QQVJBTSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9O1xuICAgIGlmKCB0b1BhcnRzWzBdICE9PSBcIlwiKSB7XG4gICAgICAgIGNhbGxiYWNrKElOVkFMSURfRlJPTV9QQVJBTSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9O1xuICAgIHZhciBhcHAgPSB0b1BhcnRzWzFdO1xuICAgIGlmKCAhYXBwKSB7XG4gICAgICAgIGNhbGxiYWNrKElOVkFMSURfRlJPTV9QQVJBTSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9O1xuICAgIHZhciByb290Um91dGUgPSB0b1BhcnRzWzJdO1xuICAgIGlmKCAhcm9vdFJvdXRlKSB7XG4gICAgICAgIGNhbGxiYWNrKElOVkFMSURfRlJPTV9QQVJBTSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9O1xuICAgIHZhciByZXN0VXJsID0gZnJvbS5zdWJzdHJpbmcoYXBwLmxlbmd0aCArIHJvb3RSb3V0ZS5sZW5ndGggKyAzKTtcbiAgICBpZiggIXJlc3RVcmwpIHtcbiAgICAgICAgY2FsbGJhY2soSU5WQUxJRF9GUk9NX1BBUkFNKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH07XG4gICAgcmVzdFVybCA9IGVuY29kZVVSSUNvbXBvbmVudChyZXN0VXJsKTtcbiAgICB2YXIgbG9jYWxQYXRoID0gXCIvXCIrcm9vdFJvdXRlK1wiL1wiK3Jlc3RVcmwrXCI/Y29tbWFuZD1wYWNrJnR5cGU9dGFyXCI7XG4gICAgaWYoIG5vcm9vdCkge1xuICAgICAgICBsb2NhbFBhdGggPSBsb2NhbFBhdGggKyBcIiZub3Jvb3Q9dHJ1ZVwiO1xuICAgIH07XG5cbiAgICB2YXIgYXBwRGF0YSA9IHtcbiAgICBcdHJvbGUgOiBhcHAsIFxuICAgIFx0dHlwZTogXCJhcHBsaWNhdGlvblwiLFxuICAgIH07XG4gICAgaWYoIHVpZCAmJiBhcHAgPT0gXCJ3b3Jrc3BhY2VzZXJ2ZXJcIikge1xuICAgIFx0YXBwRGF0YS51aWQgPSB1aWQ7XG4gICAgXHRhcHBEYXRhLnR5cGUgPSBcImFwcGxpY2F0aW9uUGVyVXNlclwiO1xuICAgIH07IFxuICAgIFxuICAgIHF1ZXJ5QXN5bmMoIG9wdGlvbnMucG9ydHMsIGFwcERhdGEsIGZ1bmN0aW9uKCBwb3J0SW5mbyl7XG4gICAgICAgIHZhciBhcHBJbmZvID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiggcG9ydEluZm8gJiYgcG9ydEluZm8ubGVuZ3RoICYmIHBvcnRJbmZvWzBdICYmIHBvcnRJbmZvWzBdLmhvc3QgJiYgcG9ydEluZm9bMF0ucG9ydCkge1xuICAgICAgICAgICAgYXBwSW5mbyA9IHBvcnRJbmZvWzBdO1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmKCAhYXBwSW5mbykge1xuICAgICAgICAgICAgY2FsbGJhY2soSU5WQUxJRF9BUFBfUkVHSVNUUlkpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBodHRwT3B0aW9ucyA9IHtcbiAgICAgICAgICAgIGhvc3RuYW1lIDogYXBwSW5mby5ob3N0LFxuICAgICAgICAgICAgcG9ydCA6IGFwcEluZm8ucG9ydCxcbiAgICAgICAgICAgIHBhdGggOiBsb2NhbFBhdGgsXG4gICAgICAgICAgICBtZXRob2QgOiBcIkdFVFwiLFxuICAgICAgICAgICAgYWdlbnQgOiBmYWxzZSAgLy8gd29yayBhcm91bmQgdGhlIGNvbmN1cnJlbnQgc29ja2V0IG9mIG5vZGUgMC4xMFxuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBoZWFkZXJzID0ge307XG4gICAgICAgIGlmKCBjb21tYW5kSWQpIHtcbiAgICAgICAgICAgIGhlYWRlcnNbXCJ0aS1jb21tYW5kLWlkXCJdID0gY29tbWFuZElkO1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmKCAhb3B0aW9ucy5pc0xvY2FsKSB7XG4gICAgICAgICAgICB1c2VySW5mbyA9IHsgdXNlcklkIDogdWlkfTtcbiAgICAgICAgICAgIHZhciB1c2VySW5mb1RleHQgPSBxdWVyeXN0cmluZy5zdHJpbmdpZnkodXNlckluZm8pO1xuICAgICAgICAgICAgaGVhZGVyc1tcInRpLXVzZXItaW5mb1wiXSA9IHVzZXJJbmZvVGV4dDtcbiAgICAgICAgfVxuICAgICAgICBodHRwT3B0aW9ucy5oZWFkZXJzID0gaGVhZGVycztcblxuICAgICAgICB2YXIgcmVxID0gaHR0cC5yZXF1ZXN0KCBodHRwT3B0aW9ucywgZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXNDb2RlICE9PSAyMDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soXCJSZXNwb25zZSBzdGF0dXMgXCIgKyByZXNwb25zZS5zdGF0dXNDb2RlKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiggcmVzcG9uc2UuaGVhZGVyc1tcImNvbnRlbnQtdHlwZVwiXSAhPT0gXCJhcHBsaWNhdGlvbi94LXRhclwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKFwiTWlzc2lnbiBoZWFkZXJzLlwiKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjYWxsYmFjayggdW5kZWZpbmVkLCByZXNwb25zZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIGNoZWNrIGZvciByZXEgZXJyb3IgdG9vXG4gICAgICAgIHJlcS5vbignZXJyb3InLCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyLm1lc3NhZ2UpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmVxLmVuZCgpO1xuICAgIH0pO1xufTtcblxuZnVuY3Rpb24gY29weUludGVybmFsKCByZXEsIGZyb20sIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gICAgZnMuc3RhdCggb3B0aW9ucy50bywgZnVuY3Rpb24oIGVycm9yLCBzdCkge1xuICAgICAgICBpZiggZXJyb3IpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYoICFzdC5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgICBjYWxsYmFjayggXCJOb3QgYSBmb2xkZXIhXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9O1xuICAgICAgICBnZXRQYWNrRGF0YSggcmVxLCBmcm9tLCBvcHRpb25zLCB1bmRlZmluZWQsIGZhbHNlLCBmdW5jdGlvbiggZXJyb3IsIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBpZiggZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayggZXJyb3IpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXNwb25zZS5vbignZXJyb3InLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhcIlRyYW5zZmVyIEVycm9yLlwiKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIHRvU3RyZWFtID0gdGFyLmV4dHJhY3Qob3B0aW9ucy50byk7XG4gICAgICAgICAgICByZXNwb25zZS5waXBlKHRvU3RyZWFtKS5vbignZmluaXNoJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdG9TdHJlYW0ub24oXCJlcnJvclwiLCBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycm9yLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHJlcVxuICogQHBhcmFtIHJlc1xuICogQHBhcmFtIG9wdGlvbnMgeyBwb3J0cywgdG8gfVxuICogQHBhcmFtIHJlcXVlc3RcbiAqIEByZXR1cm5zXG4gKi9cbmZ1bmN0aW9uIGNvcHkoIHJlcSwgcmVzLCBvcHRpb25zLCByZXF1ZXN0KSB7XG4gICAgcmVxdWVzdCA9IGluaXRSZXF1ZXN0KCByZXMsIHJlcXVlc3QpO1xuICAgIHZhciBwYXJzZWRVcmwgPSB1cmwucGFyc2UocmVxLnVybCwgdHJ1ZSk7XG4gICAgdmFyIGZyb20gPSBwYXJzZWRVcmwucXVlcnkuZnJvbTtcbiAgICB2YXIgbm9yb290ID0gISEocGFyc2VkVXJsLnF1ZXJ5Lm5vcm9vdCk7XG4gICAgZ2V0UGFja0RhdGEoIHJlcSwgZnJvbSwgb3B0aW9ucywgcmVxdWVzdC5jb21tYW5kSWQsIG5vcm9vdCwgZnVuY3Rpb24oIGVycm9yLCByZXNwb25zZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgcmVxdWVzdC5lbmRFcnJvcihlcnJvcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXNwb25zZS5vbignZXJyb3InLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmVxdWVzdC5lbmRFcnJvcihcIlRyYW5zZmVyIEVycm9yLlwiKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB2YXIgdG9TdHJlYW0gPSB0YXIuZXh0cmFjdChvcHRpb25zLnRvKTtcbiAgICAgICAgICAgIHJlc3BvbnNlLnBpcGUodG9TdHJlYW0pLm9uKCdmaW5pc2gnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmVxdWVzdC5lbmRPSygpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRvU3RyZWFtLm9uKFwiZXJyb3JcIiwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgcmVxdWVzdC5lbmRFcnJvcihlcnJvci50b1N0cmluZygpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoKGV4KXtcbiAgICAgICAgICAgIHJlcXVlc3QuZW5kRXJyb3IoZXgudG9TdHJpbmcoKSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbi8qKlxuICogQHBhcmFtIHJlcVxuICogQHBhcmFtIHJlc1xuICogQHBhcmFtIG9wdGlvbnMgeyBmcm9tIH1cbiAqIEBwYXJhbSByZXF1ZXN0XG4gKiBAcmV0dXJuc1xuICovXG5mdW5jdGlvbiBzZW5kKCByZXEsIHJlcywgb3B0aW9ucywgcmVxdWVzdCkge1xuICAgIHJlcXVlc3QgPSBpbml0UmVxdWVzdCggcmVzLCByZXF1ZXN0KTtcblxuICAgIGlmKCAhb3B0aW9ucy5pc0xvY2FsICYmICFyZXEuaGVhZGVyc1tcInRpLXVzZXItaW5mb1wiXSkge1xuICAgICAgICByZXR1cm4gcmVxdWVzdC5lbmRFcnJvcihcIk1pc3NpbmcgdXNlcmlkLlwiKTtcbiAgICB9O1xuXG4gICAgdmFyIHBhcnNlZFVybCA9IHVybC5wYXJzZShyZXEudXJsLCB0cnVlKTtcbiAgICBpZiggcGFyc2VkVXJsLnF1ZXJ5LnR5cGUgIT09IFwidGFyXCIpIHtcbiAgICAgICAgcmV0dXJuIHJlcXVlc3QuZW5kRXJyb3IoXCJNaXNzaW5nIHBhcmFtZXRlciBwYWNrLlwiKTtcbiAgICB9O1xuICAgIHZhciBub3Jvb3QgPSBwYXJzZWRVcmwucXVlcnkubm9yb290O1xuICAgIHZhciBmcm9tID0gb3B0aW9ucy5mcm9tO1xuICAgIGZzLnN0YXQoIGZyb20sIGZ1bmN0aW9uIChlcnJvciwgc3RhdHMpIHtcbiAgICAgICAgaWYoZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiByZXF1ZXN0LmVuZEVycm9yKGVycm9yLm1lc3NhZ2UpO1xuICAgICAgICB9O1xuICAgICAgICBpZihzdGF0cy5pc0ZpbGUoKSB8fCBzdGF0cy5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIFwiYXBwbGljYXRpb24veC10YXJcIik7XG4gICAgICAgICAgICB2YXIgcGFyZW50Rm9sZGVyID0gcGF0aC5kaXJuYW1lKG9wdGlvbnMuZnJvbSk7XG4gICAgICAgICAgICB2YXIgZm9sZGVyTmFtZSA9IHBhdGguYmFzZW5hbWUob3B0aW9ucy5mcm9tKTtcbiAgICAgICAgICAgIHZhciByZWFkU3RyZWFtID0gbnVsbDtcbiAgICAgICAgICAgIGlmKCBub3Jvb3QgJiYgc3RhdHMuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgICAgICAgIHJlYWRTdHJlYW0gPSB0YXIucGFjayggb3B0aW9ucy5mcm9tKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlYWRTdHJlYW0gPSB0YXIucGFjayggcGFyZW50Rm9sZGVyLCB7IGVudHJpZXMgOiBbZm9sZGVyTmFtZSBdIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJlYWRTdHJlYW0ucGlwZShyZXMpO1xuICAgICAgICAgICAgcmVxLmFkZExpc3RlbmVyKCdlbmQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiggcmVxdWVzdC5kb25lKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3QuZG9uZSgpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiByZXF1ZXN0LmVuZEVycm9yKFwiVW5zdXBwcnRlZCBmaWxlIHR5cGUuXCIpO1xuICAgICAgICB9O1xuICAgIH0pO1xufTtcblxuZXhwb3J0cy5jb3B5ID0gY29weTtcbmV4cG9ydHMuc2VuZCA9IHNlbmQ7XG5leHBvcnRzLmNvcHlJbnRlcm5hbCA9IGNvcHlJbnRlcm5hbDtcbiIsIi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMjQgVGV4YXMgSW5zdHJ1bWVudHMgSW5jb3Jwb3JhdGVkIC0gaHR0cDovL3d3dy50aS5jb20vXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLiBUaGlzIHByb2dyYW0gYW5kIHRoZSBhY2NvbXBhbnlpbmcgbWF0ZXJpYWxzXG4gKiBhcmUgbWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBFY2xpcHNlIFB1YmxpYyBMaWNlbnNlIHYxLjBcbiAqIHdoaWNoIGFjY29tcGFuaWVzIHRoaXMgZGlzdHJpYnV0aW9uLCBhbmQgaXMgYXZhaWxhYmxlIGF0XG4gKiBodHRwOi8vd3d3LmVjbGlwc2Uub3JnL2xlZ2FsL2VwbC12MTAuaHRtbFxuICpcbiAqIENvbnRyaWJ1dG9yczpcbiAqICAgICBUZXhhcyBJbnN0cnVtZW50cyBJbmNvcnBvcmF0ZWQgLSBpbml0aWFsIEFQSSBhbmQgaW1wbGVtZW50YXRpb25cbiAqXG4gKiBPcmlnaW5hbCBBdXRob3I6XG4gKiAgICAgQmFsdGFzYXIgQmVseWF2c2t5LCBUZXhhcyBJbnN0cnVtZW50cywgSW5jLlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbnZhciBjaGlsZFByb2Nlc3MgPSByZXF1aXJlKFwiY2hpbGRfcHJvY2Vzc1wiKTtcblxudmFyIENNRF9JTVBPUlQgPSBcImNjczppbXBvcnRcIjtcbnZhciBDTURfQlVJTEQgPSBcImNjczpidWlsZFwiO1xuXG5leHBvcnRzLmluaXRpYWxpemUgPSBmdW5jdGlvbihjbWRzKSB7XG4gICAgY21kc1tDTURfSU1QT1JUXVx0PSBcImNjc19pbXBvcnRcIjtcbiAgICBjbWRzW0NNRF9CVUlMRF1cdFx0PSBcImNjc19idWlsZFwiOyAgICBcbn1cblxuZXhwb3J0cy5pbmplY3RDb21tYW5kSGFuZGxlcnMgPSBmdW5jdGlvbihSZXF1ZXN0KSB7XG5cbiAgICBSZXF1ZXN0LnByb3RvdHlwZS5jY3NfaW1wb3J0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICBzZWxmLmRpc3BhdGNoKFxuICAgICAgICAgICAgZnVuY3Rpb24oKSB7IC8vIG9uRmlsZVxuICAgICAgICAgICAgICAgIHNlbGYuZW5kRXJyb3Ioc2VsZi5wYXRoICsgXCIgaXMgYSBmaWxlLlwiKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdW5jdGlvbigpIHsgLy8gb25Gb2xkZXJcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjaGlsZFByb2Nlc3MuZXhlYygnLi9jY3Mtc2VydmVyIC1ub3NwbGFzaCAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICctZGF0YSBcIi9ob21lL2d1ZXN0Ly5jY3Mtc2VydmVyL3dvcmtzcGFjZV8nICsgc2VsZi5hcHAgKyAnXCIgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnLWFwcGxpY2F0aW9uIGNvbS50aS5jY3MuYXBwcy5wcm9qZWN0SW1wb3J0ICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJy1jY3MubG9jYXRpb24gXFwnJyArIHNlbGYucGFyc2VkVXJsLnF1ZXJ5LmxvY2F0aW9uICsgJ1xcJyAnICsgLy8gd3JhcCBsb2NhdGlvbiBpbiBzaW5nbGUtcXVvdGVzIHRvIHByZXZlbnQgdmFyaWFibGUgZXhwYW5zaW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAnLWNjcy5kZWZhdWx0SW1wb3J0RGVzdGluYXRpb24gXCInICsgc2VsZi5wYXRoICsgJ1wiJywgXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3dkOiAnL21udC9jY3MvY2NzL2VjbGlwc2UnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oZXJyb3IsIHN0ZG91dCwgc3RkZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5lbmRKU09OKHsgcmVzdWx0OiBlcnJvcj8gJ2Vycm9yJzogJ09LJywgb3V0cHV0OiBzdGRvdXQgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmVuZEVycm9yKGUudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG51bGwsIC8vIG9uTWlzc2luZ1xuICAgICAgICAgICAgZnVuY3Rpb24oZXJyKSB7IC8vIG9uRXJyb3JcbiAgICAgICAgICAgICAgICBzZWxmLmVuZEVycm9yKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfTtcbiAgICBcbiAgICBSZXF1ZXN0LnByb3RvdHlwZS5jY3NfYnVpbGQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIHNlbGYuZGlzcGF0Y2goXG4gICAgICAgICAgICBmdW5jdGlvbigpIHsgLy8gb25GaWxlXG4gICAgICAgICAgICAgICAgc2VsZi5lbmRFcnJvcihzZWxmLnBhdGggKyBcIiBpcyBhIGZpbGUuXCIpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uKCkgeyAvLyBvbkZvbGRlclxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNoaWxkUHJvY2Vzcy5leGVjKCcuL2Njcy1zZXJ2ZXIgLW5vc3BsYXNoICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJy1kYXRhIFwiL2hvbWUvZ3Vlc3QvLmNjcy1zZXJ2ZXIvd29ya3NwYWNlXycgKyBzZWxmLmFwcCArICdcIiAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICctYXBwbGljYXRpb24gY29tLnRpLmNjcy5hcHBzLnByb2plY3RCdWlsZCAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICctY2NzLmxvY2F0aW9ucyBcIicgKyBzZWxmLnBhdGggKyAnXCIgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnLWNjcy5hdXRvSW1wb3J0ICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJy1jY3MuYXV0b09wZW4gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAoc2VsZi5wYXJzZWRVcmwucXVlcnkuYnVpbGRUeXBlID8gJy1jY3MuYnVpbGRUeXBlIFwiJyArIHNlbGYucGFyc2VkVXJsLnF1ZXJ5LmJ1aWxkVHlwZSArICdcIiAnIDogJycpICtcbiAgICAgICAgICAgICAgICAgICAgICAgIChzZWxmLnBhcnNlZFVybC5xdWVyeS5jb25maWd1cmF0aW9uID8gJy1jY3MuY29uZmlndXJhdGlvbiBcIicgKyBzZWxmLnBhcnNlZFVybC5xdWVyeS5jb25maWd1cmF0aW9uICsgJ1wiICcgOiAnJyksIFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN3ZDogJy9tbnQvY2NzL2Njcy9lY2xpcHNlJyBcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihlcnJvciwgc3Rkb3V0LCBzdGRlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmVuZEpTT04oeyByZXN1bHQ6IGVycm9yPyAnZXJyb3InOiAnT0snLCBvdXRwdXQ6IHN0ZG91dCB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZW5kRXJyb3IoZS50b1N0cmluZygpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbnVsbCwgLy8gb25NaXNzaW5nXG4gICAgICAgICAgICBmdW5jdGlvbihlcnIpIHsgLy8gb25FcnJvclxuICAgICAgICAgICAgICAgIHNlbGYuZW5kRXJyb3IoZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9O1xuICAgXG59IiwiLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIENvcHlyaWdodCAoYykgMjAyNCBUZXhhcyBJbnN0cnVtZW50cyBJbmNvcnBvcmF0ZWQgLSBodHRwOi8vd3d3LnRpLmNvbS9cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuIFRoaXMgcHJvZ3JhbSBhbmQgdGhlIGFjY29tcGFueWluZyBtYXRlcmlhbHNcbiAqIGFyZSBtYWRlIGF2YWlsYWJsZSB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEVjbGlwc2UgUHVibGljIExpY2Vuc2UgdjEuMFxuICogd2hpY2ggYWNjb21wYW5pZXMgdGhpcyBkaXN0cmlidXRpb24sIGFuZCBpcyBhdmFpbGFibGUgYXRcbiAqIGh0dHA6Ly93d3cuZWNsaXBzZS5vcmcvbGVnYWwvZXBsLXYxMC5odG1sXG4gKlxuICogQ29udHJpYnV0b3JzOlxuICogICAgIFRleGFzIEluc3RydW1lbnRzIEluY29ycG9yYXRlZCAtIGluaXRpYWwgQVBJIGFuZCBpbXBsZW1lbnRhdGlvblxuICpcbiAqIE9yaWdpbmFsIEF1dGhvcjpcbiAqICAgICBEb2JyaW4gQWxleGlldiwgVGV4YXMgSW5zdHJ1bWVudHMsIEluYy5cbiAqXG4gKiBDb250cmlidXRpbmcgQXV0aG9yczpcbiAqICAgICBQYXRyaWNrIENodW9uZywgVGV4YXMgSW5zdHJ1bWVudHMsIEluYy4gLSBSZWZhY3RvciBmb3Igc3RhbmRhbG9uZSB0b29scy5cbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG52YXIgZnNcdFx0XHQ9IHJlcXVpcmUoXCJmc1wiKTtcbnZhciBodHRwXHRcdD0gcmVxdWlyZShcImh0dHBcIik7XG52YXIgcGF0aFx0XHQ9IHJlcXVpcmUoXCJwYXRoXCIpO1xudmFyIHF1ZXJ5c3RyaW5nID0gcmVxdWlyZShcInF1ZXJ5c3RyaW5nXCIpO1xudmFyIHVybFx0XHRcdD0gcmVxdWlyZShcInVybFwiKTtcbnZhciBuY3BcdFx0XHQ9IHJlcXVpcmUoXCJuY3BcIikubmNwO1xudmFyIHNlcnZlU3RhdGljXHQ9IHJlcXVpcmUoXCJzZXJ2ZS1zdGF0aWNcIik7XG52YXIgdXVpZCBcdFx0PSByZXF1aXJlKFwibm9kZS11dWlkXCIpO1xudmFyIG5jcCBcdFx0PSByZXF1aXJlKFwibmNwXCIpLm5jcDtcbnZhciBvbkZpbmlzaGVkIFx0PSByZXF1aXJlKCdvbi1maW5pc2hlZCcpO1xudmFyIGR1XHRcdFx0PSByZXF1aXJlKFwiZHVcIik7XG52YXIgY2hpbGRQcm9jZXNzID0gcmVxdWlyZShcImNoaWxkX3Byb2Nlc3NcIik7XG5cbnZhciBmaWxldXRpbHNcdD0gcmVxdWlyZShcIi4uL3V0aWwvZmlsZXV0aWxzLmpzXCIpO1xudmFyIGxpc3Rlblx0XHQ9IHJlcXVpcmUoXCIuLi9uZXQvaHR0cFwiKS5maW5kUG9ydEFuZExpc3RlbjtcblxudmFyIGhlbHBlciBcdFx0PSByZXF1aXJlKFwiLi9oZWxwZXIuanNcIik7XG52YXIgY29weXJvdXRlIFx0PSByZXF1aXJlKFwiLi9jb3B5cm91dGUuanNcIik7XG52YXIgY2NzXHRcdFx0PSByZXF1aXJlKFwiLi9kZWxlZ2F0ZXMvY2NzLmpzXCIpO1xuXG4vLyBjb21tYW5kcy5cbnZhciBDTURfQ0xPU0UgPSBcImNsb3NlXCI7XG52YXIgQ01EX0dFVCA9IFwiZ2V0Q29udGVudFwiO1xudmFyIENNRF9QVVQgPSBcInB1dENvbnRlbnRcIjtcbnZhciBDTURfREVMRVRFID0gXCJkZWxldGVcIjtcbnZhciBDTURfTElTVCA9IFwibGlzdFwiO1xudmFyIENNRF9DUkVBVEUgPSBcImNyZWF0ZVwiO1xudmFyIENNRF9TVEFUUyA9IFwic3RhdHNcIjtcbnZhciBDTURfRVhJU1RTID0gXCJleGlzdHNcIjtcbnZhciBDTURfQ09QWSA9IFwiY29weVwiO1xudmFyIENNRF9SRU5BTUUgPSBcInJlbmFtZVwiO1xudmFyIENNRF9QQUNLID0gXCJwYWNrXCI7XG52YXIgQ01EX0NMT05FID0gXCJjbG9uZVwiO1xudmFyIENNRF9NRVRBID0gXCJtZXRhXCI7XG52YXIgQ01EX1NUT1JFID0gXCJzdG9yZVwiO1xudmFyIENNRF9ERiA9IFwiZGZcIjtcblxudmFyIEhUVFBfVkVSQlMgPSB7XG5cdEdFVDpDTURfR0VULFxuXHRQVVQ6Q01EX1BVVCxcblx0REVMRVRFOkNNRF9ERUxFVEVcbn07XG5cbi8vIGF0b21pYyBjb21tYW5kc1xudmFyIEFUT01JQ19DTURTID0ge1xuXHRcImNsb3NlXCJcdFx0OiB0cnVlLFxuXHRcInB1dENvbnRlbnRcIjogdHJ1ZSxcblx0XCJkZWxldGVcIlx0OiB0cnVlLFxuXHRcImNyZWF0ZVwiXHQ6IHRydWUsXG5cdFwiY29weVwiXHRcdDogdHJ1ZSxcblx0XCJyZW5hbWVcIiAgICA6IHRydWUsXG5cdFwiY2xvbmVcIlx0XHQ6IHRydWUsXG5cdFwibWV0YVwiXHRcdDogdHJ1ZSxcblx0XCJzdG9yZVwiXHRcdDogdHJ1ZVxufTtcblxuLy8gaG9vayB1cCB0aGUgbWV0aG9kcy5cbnZhciBjbWRzID0ge307XG5jbWRzW0NNRF9DTE9TRV0gXHQ9IFwiY2xvc2VcIjtcbmNtZHNbQ01EX0dFVF0gXHRcdD0gXCJnZXRDb250ZW50XCI7XG5jbWRzW0NNRF9QVVRdIFx0XHQ9IFwicHV0Q29udGVudFwiO1xuY21kc1tDTURfTElTVF0gXHRcdD0gXCJsaXN0XCI7XG5jbWRzW0NNRF9ERUxFVEVdIFx0PSBcImRlbGV0ZUl0ZW1cIjtcbmNtZHNbQ01EX0NSRUFURV0gXHQ9IFwiY3JlYXRlSXRlbVwiO1xuY21kc1tDTURfU1RBVFNdXHRcdD0gXCJzdGF0c1wiO1xuY21kc1tDTURfRVhJU1RTXVx0PSBcImV4aXN0c1wiO1xuY21kc1tDTURfQ09QWV1cdFx0PSBcImNvcHlcIjtcbmNtZHNbQ01EX1JFTkFNRV1cdD0gXCJyZW5hbWVcIjtcbmNtZHNbQ01EX1BBQ0tdXHRcdD0gXCJwYWNrXCI7XG5jbWRzW0NNRF9DTE9ORV1cdFx0PSBcImNsb25lXCI7XG5jbWRzW0NNRF9NRVRBXVx0XHQ9IFwibWV0YVwiO1xuY21kc1tDTURfU1RPUkVdXHRcdD0gXCJzdG9yZVwiO1xuY21kc1tDTURfREZdXHRcdD0gXCJkZlwiO1xuXG4vLyBnbG9iYWwgdmFyaWFibGVzXG52YXIgZ0xvZ1x0XHRcdD0gbnVsbDtcbnZhciBnUm9vdFx0XHRcdD0gbnVsbDtcbnZhciBnQ29weVNyY0Jhc2VEaXJcdD0gbnVsbDtcbnZhciBnQXBwU3RvcmFnZVx0XHQ9IG51bGw7XG52YXIgZ1NlYXBvcnRzXHRcdD0gbnVsbDtcbnZhciBnQWN0aXZpdHlXYXRjaGVyID0gbnVsbDtcbnZhciBpc0xvY2FsXHRcdFx0PSBmYWxzZTtcbnZhciBnT3B0aW9ucyAgICAgICAgPSBudWxsO1xuXG4vLyBkZWxlZ2F0ZXNcbnZhciBkZWxlZ2F0ZXMgPSBbIGNjcyBdO1xuXG4vLyBpbml0aWFsaXplIGRlbGVnYXRlc1xuZm9yKHZhciBpID0gMDsgaSA8IGRlbGVnYXRlcy5sZW5ndGg7ICsraSkge1xuXHRkZWxlZ2F0ZXNbaV0uaW5pdGlhbGl6ZShjbWRzKTtcbn1cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogV29ya3NwYWNlTG9jayBPYmplY3QuXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5mdW5jdGlvbiBXb3Jrc3BhY2VMb2NrKCB1aWQsIHdvcmtzcGFjZSwgY2FsbGJhY2spIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXHRzZWxmLmNvbXBsZXRlZCA9IGZhbHNlO1xuXHRzZWxmLmNsaWVudHMgPSBbIGNhbGxiYWNrXTtcblx0dmFyIGxvYWRDb21wbGV0ZWQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0Zm9yKHZhciBpID0gMDsgaSA8IHNlbGYuY2xpZW50cy5sZW5ndGg7ICsraSkge1xuXHRcdFx0c2VsZi5jbGllbnRzW2ldKCk7XG5cdFx0fTtcblx0XHRzZWxmLmNvbXBsZXRlZCA9IHRydWU7XG5cdH07XG5cblx0Z0FwcFN0b3JhZ2UucmVzdG9yZSh1aWQsIHdvcmtzcGFjZSwgbG9hZENvbXBsZXRlZCxcbi8vXHRcdHtcInNlc3Npb25JZFwiOiBwYXJhbXMuYnJvd3NlclNlc3Npb25JZH0gIC8vIFRPRE8gKGRvYnJpbikgLSBhZGQgdGhlIGJyb3dzZXIgc2Vzc2lvbklEIC0gaXQgaXMgb25seSB1c2VkIGluIHRoZSBsb2dnaW5nLlxuXHRcdG51bGwpO1xuXG4vLyB0ZXN0IGNvZGVcbi8vXHRmcy5ta2Rpciggd29ya3NwYWNlLCBmdW5jdGlvbihlKXtcbi8vXHRcdHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuLy9cdFx0XHRnQXBwU3RvcmFnZS5yZXN0b3JlKHVpZCwgd29ya3NwYWNlLCBsb2FkQ29tcGxldGVkLG51bGwpO1xuLy9cdFx0fSwgNDAwMCk7XG4vL1x0fSk7XG4vLyBlbmQgb2YgdGVzdCBjb2RlXG59O1xuXG5Xb3Jrc3BhY2VMb2NrLnByb3RvdHlwZS53YWl0ID0gZnVuY3Rpb24oIGNhbGxiYWNrKSB7XG5cdGlmKCB0aGlzLmNvbXBsZXRlZCkge1xuXHRcdGNhbGxiYWNrKCk7XG5cdH07XG5cdHRoaXMuY2xpZW50cy5wdXNoKCBjYWxsYmFjayk7XG59O1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBXb3Jrc3BhY2VMb2FkZXIgT2JqZWN0LlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuZnVuY3Rpb24gV29ya3NwYWNlTG9hZGVyKCkge1xuXHR0aGlzLmxvY2tzID0ge307XG59O1xuXG5Xb3Jrc3BhY2VMb2FkZXIucHJvdG90eXBlLndhaXRUb0xvYWQgPSBmdW5jdGlvbiggdWlkLCB3b3Jrc3BhY2UsIGNhbGxiYWNrKSB7XG5cdHZhciBsb2NrID0gdGhpcy5nZXRMb2NrKHVpZCwgd29ya3NwYWNlKTtcblx0aWYoICFsb2NrKSB7XG5cdFx0aWYoIGZzLmV4aXN0c1N5bmMod29ya3NwYWNlKSkge1xuXHRcdFx0cmV0dXJuIGNhbGxiYWNrKCk7XG5cdFx0fTtcblx0XHR0aGlzLmFkZExvY2soIHVpZCwgd29ya3NwYWNlLCBjYWxsYmFjayk7XG5cdH1cblx0ZWxzZSB7XG5cdFx0bG9jay53YWl0KCBjYWxsYmFjayk7XG5cdH1cbn07XG5cbldvcmtzcGFjZUxvYWRlci5wcm90b3R5cGUuZ2V0TG9jayA9IGZ1bmN0aW9uKCB1aWQsIHdvcmtzcGFjZSkge1xuXHRpZiggIXRoaXMubG9ja3NbdWlkXSkge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH07XG5cdHJldHVybiB0aGlzLmxvY2tzW3VpZF1bd29ya3NwYWNlXTtcbn07XG5cbldvcmtzcGFjZUxvYWRlci5wcm90b3R5cGUuYWRkTG9jayA9IGZ1bmN0aW9uKCB1aWQsIHdvcmtzcGFjZSwgY2FsbGJhY2spIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXHR2YXIgbG9jayA9IG5ldyBXb3Jrc3BhY2VMb2NrKCB1aWQsIHdvcmtzcGFjZSwgY2FsbGJhY2spO1xuXHRpZiggIXNlbGYubG9ja3NbdWlkXSkge1xuXHRcdHNlbGYubG9ja3NbdWlkXSA9IHt9O1xuXHR9O1xuXHRzZWxmLmxvY2tzW3VpZF1bd29ya3NwYWNlXSA9IGxvY2s7XG5cdC8vIG1ha2Ugc3VyZSB3ZSBkZWxldGUgdGhlIG9iamVjdCBvbmNlIHdhaXQgY29tcGxldGVzLlxuXHRsb2NrLndhaXQoIGZ1bmN0aW9uKCkge1xuXHRcdGRlbGV0ZSBzZWxmLmxvY2tzW3VpZF1bd29ya3NwYWNlXTtcblx0XHRpZiggT2JqZWN0LmtleXMoc2VsZi5sb2Nrc1t1aWRdKSA9PSAwKXtcblx0XHRcdGRlbGV0ZSBzZWxmLmxvY2tzW3VpZF07XG5cdFx0fTtcblx0fSk7XG59O1xuXG52YXIgd3NMb2FkZXIgPSBuZXcgV29ya3NwYWNlTG9hZGVyKCk7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIFJlcXVlc3QgT2JqZWN0LlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbmZ1bmN0aW9uIFJlcXVlc3QoKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblx0dGhpcy5wYXJzZWRVcmwgPSBudWxsO1xuXHR0aGlzLmNvbXBsZXRlZCA9IGZhbHNlO1xuXHR0aGlzLnVpZCA9IG51bGw7XG5cdHRoaXMuY29tbWFuZCA9IG51bGw7XG5cdHRoaXMudXJsUGF0aCA9IG51bGw7XG5cdHRoaXMucGF0aCA9IG51bGw7XG5cdHRoaXMud29ya3NwYWNlUGF0aCA9IG51bGw7XG5cdHRoaXMudXNlclJvb3RQYXRoID0gbnVsbDtcblx0dGhpcy5kaXJlY3RvcnkgPSBmYWxzZTtcblx0dGhpcy5maWx0ZXIgPSBmYWxzZTtcblx0dGhpcy5yZWN1cnNpdmUgPSBmYWxzZTtcblx0dGhpcy5pbnRlcm5hbENvbW1hbmQgPSBmYWxzZTtcblx0dGhpcy5pbnRlcm5hbENhbGxiYWNrID0gdW5kZWZpbmVkO1xuXHR0aGlzLmludGVybmFsRXJyb3IgPSB1bmRlZmluZWQ7XG5cdHRoaXMubWV0YVBhcmFtcyA9IHsgY2xlYXJGbGFnIDogdHJ1ZSwgcXVlcnlEQkJhY2t1cEZhaWxlZCA6IHVuZGVmaW5lZH07XG5cdHRoaXMudGltZXIgPSBuZXcgc2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG5cdFx0c2VsZi5vbk1heFRpbWUoKTtcblx0fSxpbnN0cnVtZW50YXRpb24ubWF4VGltZSk7XG59O1xuXG4vLyBpbmplY3QgZGVsZWdhdGUgY29tbWFuZCBoYW5kbGVyc1xuZm9yKHZhciBpID0gMDsgaSA8IGRlbGVnYXRlcy5sZW5ndGg7ICsraSkge1xuXHRkZWxlZ2F0ZXNbaV0uaW5qZWN0Q29tbWFuZEhhbmRsZXJzKFJlcXVlc3QpO1xufVxuXG5SZXF1ZXN0LnByb3RvdHlwZS5kZWZlcnJlZFJlcXMgPSB7fTtcblJlcXVlc3QucHJvdG90eXBlLmN1cnJlbnRSZXFzID0ge307XG5cblJlcXVlc3QucHJvdG90eXBlLnByZXZlbnRPblJvb3QgPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIHRoaXMuY29tbWFuZCA9PSBDTURfREVMRVRFIHx8IHRoaXMuY29tbWFuZCA9PSBDTURfUkVOQU1FIHx8IHRoaXMuY29tbWFuZCA9PSBDTURfQ0xPTkU7XG59O1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24ocmVxLCByZXMpIHtcblx0dGhpcy5yZXEgPSByZXE7XG5cdHRoaXMucmVzID0gcmVzO1xuXHRpZiAoIWlzTG9jYWwpIHtcblx0XHR2YXIgdXNlckluZm8gPSB0aGlzLnJlcS5oZWFkZXJzW1widGktdXNlci1pbmZvXCJdO1xuXHRcdGlmKCAhdXNlckluZm8pIHtcblx0XHRcdHRoaXMuZW5kRXJyb3IoIFwiQ2Fubm90IGlkZW50aWZ5IHRoZSB1c2VyLiBNaXNzaW5nIGhlYWRlciBpbmZvLlwiKTtcblx0XHRcdHJldHVybjtcblx0XHR9O1xuXHRcdHRoaXMudWlkID0gcXVlcnlzdHJpbmcucGFyc2UodXNlckluZm8pLnVzZXJJZDtcblx0XHRpZiggIXRoaXMudWlkKSB7XG5cdFx0XHR0aGlzLmVuZEVycm9yKCBcIkNhbm5vdCBpZGVudGlmeSB0aGUgdXNlci4gTWlzc2luZyB1c2VySWQgaW5zaWRlIGhlYWRlciBpbmZvLlwiKTtcblx0XHRcdHJldHVybjtcblx0XHR9O1xuXHR9O1xuXG5cdHZhciByZXF1ZXN0Q29tbWFuZElkID0gdGhpcy5yZXEuaGVhZGVyc1tcInRpLWNvbW1hbmQtaWRcIl07XG5cdGlmKCByZXF1ZXN0Q29tbWFuZElkKSB7XG5cdFx0dGhpcy5yZXF1ZXN0Q29tbWFuZElkID0gcmVxdWVzdENvbW1hbmRJZDtcblx0fTtcblxuXHR0aGlzLmxvZ0luZm8oXCJjb21tYW5kc1wiLCBcIlVSTD1cIit0aGlzLnJlcS51cmwpO1xuXG5cdHZhciBwYXJzZWRVcmwgPSB0aGlzLnBhcnNlZFVybCA9IHVybC5wYXJzZSh0aGlzLnJlcS51cmwsIHRydWUpO1xuXHR0aGlzLmNvbW1hbmQgPSBIVFRQX1ZFUkJTW3RoaXMucmVxLm1ldGhvZF07XG5cdGlmKCAhdGhpcy5jb21tYW5kKSB7XG5cdFx0dGhpcy5jb21tYW5kID0gQ01EX0dFVDtcblx0fTtcblxuXHRpZiggcGFyc2VkVXJsLnF1ZXJ5LmNvbW1hbmQpIHtcblx0XHR0aGlzLmNvbW1hbmQgPSBwYXJzZWRVcmwucXVlcnkuY29tbWFuZDtcblx0fTtcblx0aWYoIHBhcnNlZFVybC5xdWVyeS5maWx0ZXIpIHtcblx0XHR0aGlzLmZpbHRlciA9IHBhcnNlZFVybC5xdWVyeS5maWx0ZXI7XG5cdH07XG5cdGlmKCBwYXJzZWRVcmwucXVlcnkucmVjdXJzaXZlKSB7XG5cdFx0dGhpcy5yZWN1cnNpdmUgPSAocGFyc2VkVXJsLnF1ZXJ5LnJlY3Vyc2l2ZSA9PSBcInRydWVcIik7XG5cdH07XG5cdGlmKCBwYXJzZWRVcmwucXVlcnkudG8pIHtcblx0XHR2YXIgdG8gPSBwYXJzZWRVcmwucXVlcnkudG87XG5cdFx0aWYoICFoZWxwZXIudmFsaWRGaWxlTmFtZSh0bykpIHtcblx0XHRcdHRoaXMuZW5kRXJyb3IoIFwiSW52YWxpZCBwYXJhbWV0ZXI6dG8uXCIpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHR0aGlzLnRvID0gdG87XG5cdH1cblxuXHQvLyBwYXJzZSBhZGRpdGlvbmFsIHBhcmFtZXRlcnNcblx0aWYoIHBhcnNlZFVybC5xdWVyeS5kaXJlY3RvcnkgPT09IFwidHJ1ZVwiKSB7XG5cdFx0dGhpcy5kaXJlY3RvcnkgPSB0cnVlO1xuXHR9O1xuXG5cdGlmKCBwYXJzZWRVcmwucXVlcnkuY2xlYXJGbGFnID09IFwiZmFsc2VcIikge1xuXHRcdHRoaXMubWV0YVBhcmFtcy5jbGVhckZsYWcgPSBmYWxzZTtcblx0fTtcblxuXHRpZiggdHlwZW9mIHBhcnNlZFVybC5xdWVyeS5xdWVyeURCQmFja3VwRmFpbGVkICE9IHVuZGVmaW5lZCkge1xuXHRcdHRoaXMubWV0YVBhcmFtcy5xdWVyeURCQmFja3VwRmFpbGVkID0gdHJ1ZTtcblx0fTtcblxuXHR0cnkge1xuXHRcdHRoaXMudXJsUGF0aCA9IGRlY29kZVVSSUNvbXBvbmVudChwYXJzZWRVcmwucGF0aG5hbWUpO1xuXHR9XG5cdGNhdGNoKCBlcnIpIHtcblx0XHR0aGlzLmVuZEVycm9yKCBcIkludmFsaWQgUGF0aC5cIik7XG5cdFx0cmV0dXJuO1xuXHR9O1xuXHRpZiggIWhlbHBlci52YWxpZFBhdGhOYW1lKHRoaXMudXJsUGF0aCkpIHtcblx0XHQvLyBwcmV2ZW50IGFjY2VzcyB0byBwYXJlbnQgZm9sZGVycyBcIi4uXCIuXG5cdFx0dGhpcy5lbmRFcnJvciggXCJJbnZhbGlkIFBhdGguXCIpO1xuXHRcdHJldHVybjtcblx0fTtcblxuXHR2YXIgcGF0aFNlY3Rpb25zID0gdGhpcy51cmxQYXRoLnNwbGl0KFwiL1wiKTtcblx0aWYgKCFpc0xvY2FsKSB7XG5cdFx0dGhpcy5hcHAgPSBwYXRoU2VjdGlvbnMubGVuZ3RoID4gMSA/IHBhdGhTZWN0aW9uc1sxXSA6IG51bGw7XG5cdFx0aWYoICF0aGlzLmFwcCkge1xuXHRcdFx0dGhpcy5lbmRFcnJvciggXCJNaXNzaW5nIGFwcCBmcm9tIHRoZSBVUkwgKGZpcnN0IHNlZ21lbnQpLlwiKTtcblx0XHRcdHJldHVybjtcblx0XHR9O1xuXHR9O1xuXG5cdHZhciB3b3Jrc3BhY2VTZWdtZW50ID0gIWlzTG9jYWwgPyAyIDogMTtcblx0dGhpcy53b3Jrc3BhY2VOYW1lID0gcGF0aFNlY3Rpb25zLmxlbmd0aCA+IHdvcmtzcGFjZVNlZ21lbnQgPyBwYXRoU2VjdGlvbnNbd29ya3NwYWNlU2VnbWVudF0gOiBudWxsO1xuXHRpZiggIXRoaXMud29ya3NwYWNlTmFtZSkge1xuXHRcdHRoaXMuZW5kRXJyb3IoIFwiTWlzc2luZyB3b3Jrc3BhY2UgZnJvbSB0aGUgVVJMIChzZWNvbmQgc2VnbWVudCkuXCIpO1xuXHRcdHJldHVybjtcblx0fTtcblx0aWYoICF0aGlzLnZhbGlkV29ya3NwYWNlTmFtZSh0aGlzLndvcmtzcGFjZU5hbWUpKSB7XG5cdFx0dGhpcy5lbmRFcnJvciggXCJJbnZhbGlkIFBhdGguXCIpO1xuXHRcdHJldHVybjtcblx0fTtcblxuLy9cdHRoaXMucGF0aCA9IHBhdGguam9pbihnUm9vdCwgIWlzTG9jYWwgPyB0aGlzLnVpZCA6IFwiXCIsIHRoaXMudXJsUGF0aCk7XG4vL1x0dGhpcy53b3Jrc3BhY2VQYXRoID0gcGF0aC5qb2luKGdSb290LCAhaXNMb2NhbCA/IHRoaXMudWlkIDogXCJcIiwgIWlzTG9jYWwgPyB0aGlzLmFwcCA6IFwiXCIsIHRoaXMud29ya3NwYWNlTmFtZSk7XG4vL1x0dGhpcy51c2VyUm9vdFBhdGggPSBwYXRoLmpvaW4oZ1Jvb3QsICFpc0xvY2FsID8gdGhpcy51aWQgOiBcIlwiKTtcblxuXHR0aGlzLnBhdGggPSBwYXRoLmpvaW4oZ1Jvb3QsIHRoaXMudXJsUGF0aCk7XG5cblx0aWYoIGlzTG9jYWwpIHtcblx0XHR0aGlzLndvcmtzcGFjZVBhdGggPSBwYXRoLmpvaW4oZ1Jvb3QsIHRoaXMud29ya3NwYWNlTmFtZSk7XG5cdH1cblx0ZWxzZSB7XG5cdFx0dGhpcy53b3Jrc3BhY2VQYXRoID0gcGF0aC5qb2luKGdSb290LCB0aGlzLmFwcCwgdGhpcy53b3Jrc3BhY2VOYW1lKTtcblx0fVxuXHR0aGlzLnVzZXJSb290UGF0aCA9IHBhdGguam9pbihnUm9vdCwgXCJcIik7XG5cblx0Ly8gc29tZSBjb21tYW5kcyBhcmUgbm90IGFsbG93ZWQgb24gdGhlIHJvb3Qgd29ya3NwYWNlIGZvbGRlci5cblx0dmFyIHJlbCA9IHBhdGgucmVsYXRpdmUodGhpcy53b3Jrc3BhY2VQYXRoLCB0aGlzLnBhdGgpO1xuXHRpZiggcmVsLmxlbmd0aCA9PSAwICYmIHRoaXMucHJldmVudE9uUm9vdCgpKSB7XG5cdFx0dGhpcy5lbmRFcnJvciggdGhpcy5jb21tYW5kICArIFwiIGNhbm5vdCBiZSBleGVjdXRlZCBvbiB3b3Jrc3BhY2Ugcm9vdC5cIik7XG5cdFx0cmV0dXJuO1xuXHR9O1xuXG5cdGlmKCAhaXNMb2NhbCAmJiBwYXRoU2VjdGlvbnMubGVuZ3RoID4gd29ya3NwYWNlU2VnbWVudCArIDEgJiYgcGF0aFNlY3Rpb25zW3dvcmtzcGFjZVNlZ21lbnQgKyAxXSA9PSBTQ1JBVENIX05BTUUpIHtcblx0XHR0aGlzLnBhdGggPSBwYXRoLmpvaW4oXCIvdG1wXCIsIHRoaXMudXJsUGF0aCk7XG5cdFx0dGhpcy51c2VyUm9vdFBhdGggPSBwYXRoLmpvaW4oXCIvdG1wXCIsIFwiXCIpO1xuXHR9XG59O1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5pbml0SW50ZXJuYWxDbG9zZSA9IGZ1bmN0aW9uKCB1aWQsIHdvcmtzcGFjZVBhdGgsIGNhbGxiYWNrKSB7XG5cdHRoaXMuY29tbWFuZCA9IENNRF9DTE9TRTtcblx0dGhpcy5pbnRlcm5hbENvbW1hbmQgPSB0cnVlO1xuXHR0aGlzLmludGVybmFsQ2FsbGJhY2sgPSBjYWxsYmFjaztcblx0dGhpcy5pbnRlcm5hbEVycm9yID0gdW5kZWZpbmVkO1xuXHR2YXIgcGF0aFNlY3Rpb25zID0gd29ya3NwYWNlUGF0aC5zcGxpdChcIi9cIik7XG5cdGlmKCBwYXRoU2VjdGlvbnMubGVuZ3RoIDw9IDMpIHtcblx0XHR0aGlzLmVuZEVycm9yKFwiSW52YWxpZCB3b3Jrc3BhY2UgcGF0aFwiKTtcblx0XHRyZXR1cm47XG5cdH1cblx0dGhpcy53b3Jrc3BhY2VQYXRoID0gd29ya3NwYWNlUGF0aDtcblx0dGhpcy53b3Jrc3BhY2VOYW1lID0gcGF0aFNlY3Rpb25zW3BhdGhTZWN0aW9ucy5sZW5ndGgtMV07XG5cdHRoaXMuYXBwID0gcGF0aFNlY3Rpb25zW3BhdGhTZWN0aW9ucy5sZW5ndGgtMl07XG5cdHRoaXMudWlkID0gcGF0aFNlY3Rpb25zW3BhdGhTZWN0aW9ucy5sZW5ndGgtM107XG5cdHRoaXMudXJsUGF0aCA9IFwiSU5URVJOQUwgQ0xPU0UgQ09NTUFORFwiO1xufTtcblxuUmVxdWVzdC5wcm90b3R5cGUubG9nQW55ID0gZnVuY3Rpb24oIHN0cmVhbSwgaWQsIHRleHQpIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdC8vIERlc2t0b3AgTm9kZSBBcHAgY2FuIGJlIHN0YXJ0ZWQgd2l0aG91dCBjb25zb2xlLlxuXHRpZiggIWdMb2cgfHwgIWdMb2dbc3RyZWFtXSB8fCB0eXBlb2YgZ0xvZ1tzdHJlYW1dICE9PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRyZXR1cm47XG5cdH07XG5cblx0dmFyIG5ld1RleHQgPSB0ZXh0O1xuXHRpZiggc2VsZi51aWQpIHtcblx0XHRuZXdUZXh0ID0gdGV4dCArIFwiIHVzZXJpZCA9IFwiICsgc2VsZi51aWQ7XG5cdH07XG5cdGlmKCBzZWxmLnJlcSkge1xuXHRcdGdMb2dbc3RyZWFtXShpZCwgbmV3VGV4dCwgc2VsZi5yZXEudXJsKTtcblx0fVxuXHRlbHNlIHtcblx0XHRnTG9nW3N0cmVhbV0oaWQsIG5ld1RleHQpO1xuXHR9O1xufTtcblxuUmVxdWVzdC5wcm90b3R5cGUubG9nSW5mbyA9IGZ1bmN0aW9uKCBpZCwgdGV4dCkge1xuXHR0aGlzLmxvZ0FueSggXCJpbmZvXCIsIGlkLCB0ZXh0KTtcbn07XG5cblJlcXVlc3QucHJvdG90eXBlLmxvZ0Vycm9yID0gZnVuY3Rpb24oIGlkLCB0ZXh0KSB7XG5cdHRoaXMubG9nQW55KCBcImVycm9yXCIsIGlkLCB0ZXh0KTtcbn07XG5cblJlcXVlc3QucHJvdG90eXBlLnZhbGlkV29ya3NwYWNlTmFtZSA9IGZ1bmN0aW9uKCBwYXJhbSkge1xuXHRpZiggIWhlbHBlci52YWxpZFBhdGhOYW1lKHBhcmFtKSlcblx0XHRyZXR1cm4gZmFsc2U7XG5cdGlmKCBwYXJhbS5pbmRleE9mKFwiJFwiKSAhPSAtMSlcblx0XHRyZXR1cm4gZmFsc2U7XG5cdGlmKCBwYXJhbS5pbmRleE9mKFwiJ1wiKSAhPSAtMSlcblx0XHRyZXR1cm4gZmFsc2U7XG5cdGlmKCBwYXJhbS5pbmRleE9mKCdcIicpICE9IC0xKVxuXHRcdHJldHVybiBmYWxzZTtcblx0aWYoIHBhcmFtLmluZGV4T2YoXCJgXCIpICE9IC0xKVxuXHRcdHJldHVybiBmYWxzZTtcblx0cmV0dXJuIHRydWU7XG59O1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5leGVjdXRlID0gZnVuY3Rpb24oKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblx0aWYoIHNlbGYuaXNDb21wbGV0ZWQoKSkge1xuXHRcdHJldHVybjtcblx0fTtcblx0aWYoICFzZWxmLmNvbW1hbmQpIHtcblx0XHRzZWxmLmVuZEVycm9yKFwiTWlzc2luZyBjb21tYW5kLlwiKTtcblx0XHRyZXR1cm47XG5cdH07XG5cdHZhciBjdXJyZW50ID0gbnVsbDtcblx0Zm9yKHZhciBjbWQgaW4gY21kcykge1xuXHRcdGlmKCBjbWQgPT09IHNlbGYuY29tbWFuZCkge1xuXHRcdFx0Y3VycmVudCA9IGNtZDtcblx0XHRcdGJyZWFrO1xuXHRcdH07XG5cdH07XG5cdGlmKCAhY3VycmVudCkge1xuXHRcdHNlbGYuZW5kRXJyb3IoIFwiVW5zdXBwb3J0ZWQgY29tbWFuZDogXCIrIHNlbGYuY29tbWFuZCk7XG5cdFx0cmV0dXJuO1xuXHR9O1xuXG5cdGZ1bmN0aW9uIGFkZFRvRGVmZXJSZXFzUShyZXEpIHtcblx0XHR2YXIgZGVmUmVxc1EgPSBSZXF1ZXN0LnByb3RvdHlwZS5kZWZlcnJlZFJlcXNbcmVxLndvcmtzcGFjZVBhdGhdO1xuXHRcdGlmICghZGVmUmVxc1EpIHtcblx0XHRcdFJlcXVlc3QucHJvdG90eXBlLmRlZmVycmVkUmVxc1tyZXEud29ya3NwYWNlUGF0aF0gPSBbcmVxXTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZGVmUmVxc1EucHVzaChyZXEpO1xuXHRcdH1cblx0fTtcblxuXHQvKlxuXHQgKiBJZiB0aGVyZSBhcmUgY3VycmVudCByZXF1ZXN0cywgdGhhbiB3ZSBuZWVkIHRvIGNoZWNrIHdoZXRoZXIgdGhlXG5cdCAqIHJlcXVlc3QgY2FuIGJlIGV4ZWN1dGUgaW4gcGFyYWxsZWwgd2l0aCB0aGUgY3VycmVudCByZXF1ZXN0cyBvciBub3QuXG5cdCAqL1xuXHR2YXIgZGVmZXIgPSBmYWxzZTtcblx0dmFyIGN1clJlcXNRID0gUmVxdWVzdC5wcm90b3R5cGUuY3VycmVudFJlcXNbc2VsZi53b3Jrc3BhY2VQYXRoXTtcblx0aWYgKCEhY3VyUmVxc1EpIHtcblxuXHRcdC8qIEEgY29weSBmcm9tIHdvcmtzcGFjZSB0byB3b3Jrc3BhY2UgZ2VuZXJhdGVzIGdldENvbnRlbnQgdGhhdCBuZWVkcyBiZSBsZXQgdGhyb3VnaC4gKi9cblx0XHRpZiggc2VsZi5yZXF1ZXN0Q29tbWFuZElkICYmIHNlbGYucmVxdWVzdENvbW1hbmRJZCA9PSBjdXJSZXFzUVswXS5jb21tYW5kSWQpIHtcblx0XHRcdHNlbGYuYnlwYXNzUXVldWUgPSB0cnVlO1xuXHRcdH1cblxuXHRcdC8qIGlmIHRoZSByZXF1ZXN0IGlzIGFuIGF0b21pYyByZXF1ZXN0LCB0aGFuIGp1c3QgYWRkIGl0IHRvIHRoZSBkZWZlciBRICovXG5cdFx0ZWxzZSBpZiAoISFBVE9NSUNfQ01EU1tzZWxmLmNvbW1hbmRdKSB7XG5cdFx0XHRkZWZlciA9IHRydWU7XG5cdFx0XHRhZGRUb0RlZmVyUmVxc1Eoc2VsZik7XG5cblx0XHQvKiBjaGVjayBpZiB0aGUgcmVxdWVzdCBpcyBjb21wYXRpYmxlIHdpdGggY3VycmVudCByZXF1ZXN0cyAqL1xuXHRcdH0gZWxzZSBpZiAoY3VyUmVxc1EubGVuZ3RoID4gMCAmJiAhIUFUT01JQ19DTURTW2N1clJlcXNRWzBdLmNvbW1hbmRdKXtcblx0XHRcdGRlZmVyID0gdHJ1ZTtcblx0XHRcdGFkZFRvRGVmZXJSZXFzUShzZWxmKTtcblx0XHR9XG5cdH1cblxuXHRzZWxmLmxvZ0luZm8oXCJjb21tYW5kcy1jb25jdXJyZW50XCIsIChkZWZlciA/IFwiRGVmZXJyaW5nIFwiIDogXCJFeGVjdXRpbmcgXCIpICsgc2VsZi5jb21tYW5kICsgXCIgd2hlcmUgdXJsPVwiICsgc2VsZi51cmxQYXRoKTtcblx0aWYgKCFkZWZlcikge1xuXG5cdFx0aWYoICFzZWxmLmJ5cGFzc1F1ZXVlKSB7XG5cdFx0XHRpZiAoIWN1clJlcXNRKSB7XG5cdFx0XHRcdFJlcXVlc3QucHJvdG90eXBlLmN1cnJlbnRSZXFzW3NlbGYud29ya3NwYWNlUGF0aF0gPSBbc2VsZl07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjdXJSZXFzUS5wdXNoKHNlbGYpO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRzZWxmLmVuc3VyZVdvcmtzcGFjZUV4aXN0cyggZnVuY3Rpb24oIGVycm9yKSB7XG4vLyBJIGhhdmUgdGVzdCBjYXNlcyB0aGF0IG1ha2Ugb3BlcmF0aW9ucyB0YWtlIGxvbmcgdGltZSB0byBjb21wbGV0ZSBzbyBJIGNhbiB0ZXN0IHRoZSBkZWZlcnJlZCBxdWV1ZS5cblx0XHRcdGlmKCBpbnN0cnVtZW50YXRpb24uZGVsYXkpIHtcblx0XHRcdFx0c2V0VGltZW91dCggZnVuY3Rpb24oKXtcblx0XHRcdFx0XHRpZiggIXNlbGYuaXNDb21wbGV0ZWQoKSkge1xuXHRcdFx0XHRcdFx0c2VsZltjbWRzW2N1cnJlbnRdXSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxpbnN0cnVtZW50YXRpb24uZGVsYXkpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHNlbGZbY21kc1tjdXJyZW50XV0oKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxufTtcblxuUmVxdWVzdC5wcm90b3R5cGUuZG9uZSA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cdGlmKCBzZWxmLnRpbWVyKSB7XG5cdFx0Y2xlYXJUaW1lb3V0KCBzZWxmLnRpbWVyKTtcblx0XHRzZWxmLnRpbWVyID0gbnVsbDtcblx0fVxuXHRpZiggc2VsZi5pbnRlcm5hbENvbW1hbmQpIHtcblx0XHRzZWxmLmludGVybmFsQ2FsbGJhY2soIHNlbGYuaW50ZXJuYWxFcnJvcik7XG5cdH07XG5cblx0c2VsZi5sb2dJbmZvKFwiY29tbWFuZHMtY29uY3VycmVudFwiLCBcIkNvbXBsZXRlZCBcIiArIHNlbGYuY29tbWFuZCArIFwiIHdoZXJlIHVybD1cIiArIHNlbGYudXJsUGF0aCk7XG5cblx0aWYoIHNlbGYuYnlwYXNzUXVldWUpIHtcblx0XHRyZXR1cm47XG5cdH07XG5cblx0LyogcmVtb3ZlIHRoZSBjdXJyZW50IHJlcXVlc3QgZnJvbSB0aGUgUSAqL1xuXHR2YXIgY3VyUmVxc1EgPSBSZXF1ZXN0LnByb3RvdHlwZS5jdXJyZW50UmVxc1tzZWxmLndvcmtzcGFjZVBhdGhdO1xuXHRpZiAoISFjdXJSZXFzUSkge1xuXHRcdGZvciAodmFyIGkgPSAwLCBsID0gY3VyUmVxc1EubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG5cdFx0XHRpZiAoY3VyUmVxc1FbaV0gPT09IHNlbGYpIHtcblx0XHRcdFx0Y3VyUmVxc1Euc3BsaWNlKGksIDEpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoY3VyUmVxc1EubGVuZ3RoID09IDApXG5cdFx0XHRkZWxldGUgUmVxdWVzdC5wcm90b3R5cGUuY3VycmVudFJlcXNbc2VsZi53b3Jrc3BhY2VQYXRoXTtcblx0fVxuXG5cdC8qIEluIHRoZSBjYXNlIHRoYXQgdGhlIHRpbWVvdXQgZXhwaXJlcyBhbmQgdGhlIHJlcXVlc3QgaGFzIG5ldmVyIGJlZW4gcmVtb3ZlZFxuXHQgICBmcm9tIHRoZSBkZWZlcnJlZCBxdWV1ZSBtYWtlIHN1cmUgd2UgcmVtb3ZlIGl0IGZyb20gdGhlcmUuKi9cblx0dmFyIGRlZlJlcXNRID0gUmVxdWVzdC5wcm90b3R5cGUuZGVmZXJyZWRSZXFzW3NlbGYud29ya3NwYWNlUGF0aF07XG5cdGlmKCBkZWZSZXFzUSAmJiBkZWZSZXFzUS5sZW5ndGggPiAwKSB7XG5cdFx0Zm9yICh2YXIgaSA9IDAsIGwgPSBkZWZSZXFzUS5sZW5ndGg7IGkgPCBsOyArK2kpIHtcblx0XHRcdGlmIChkZWZSZXFzUVtpXSA9PT0gc2VsZikge1xuXHRcdFx0XHRkZWZSZXFzUS5zcGxpY2UoaSwgMSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChkZWZSZXFzUS5sZW5ndGggPT0gMClcblx0XHRcdGRlbGV0ZSBSZXF1ZXN0LnByb3RvdHlwZS5kZWZlcnJlZFJlcXNbc2VsZi53b3Jrc3BhY2VQYXRoXTtcblx0fTtcblxuXG5cdC8qIGN1cnJlbnQgcmVxdWVzdCBRIGlzIGVtcHR5LCBzbyBtb3ZlIG9uIHRvIHRoZSBuZXh0IGRlZmVycmVkIHJlcXVlc3QgKi9cblx0aWYgKCFSZXF1ZXN0LnByb3RvdHlwZS5jdXJyZW50UmVxc1tzZWxmLndvcmtzcGFjZVBhdGhdKSB7XG5cdFx0ZGVmUmVxc1EgPSBSZXF1ZXN0LnByb3RvdHlwZS5kZWZlcnJlZFJlcXNbc2VsZi53b3Jrc3BhY2VQYXRoXTtcblx0XHRpZiAoISFkZWZSZXFzUSkge1xuXHRcdFx0aWYgKGRlZlJlcXNRLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0dmFyIG5leHRSZXEgPSBkZWZSZXFzUS5zaGlmdCgpO1xuXHRcdFx0XHRpZiAoZGVmUmVxc1EubGVuZ3RoID09IDApIHtcblx0XHRcdFx0XHRkZWxldGUgUmVxdWVzdC5wcm90b3R5cGUuZGVmZXJyZWRSZXFzW3NlbGYud29ya3NwYWNlUGF0aF07XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRuZXh0UmVxLmV4ZWN1dGUoKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn07XG5cbi8qKlxuICpcbiAqIEBwYXJhbSBvbkZpbGVcbiAqIEBwYXJhbSBvbkZvbGRlclxuICogQHBhcmFtIG9uTWlzc2luZyAtIG9wdGlvbmFsXG4gKiBAcGFyYW0gb25FcnJvciAtIG9wdGlvbmFsXG4gKi9cblJlcXVlc3QucHJvdG90eXBlLmRpc3BhdGNoID0gZnVuY3Rpb24oIG9uRmlsZSwgb25Gb2xkZXIsIG9uTWlzc2luZywgb25FcnJvciApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXHRzZWxmLmxvZ0luZm8oXCJjb21tYW5kc1wiLCBzZWxmLmNvbW1hbmQgKyBcIiBcIiArIHNlbGYucGF0aCk7XG5cdGZzLnN0YXQoIHNlbGYucGF0aCwgZnVuY3Rpb24oZXJyb3IsIHN0YXRzKSB7XG5cdFx0aWYoIGVycm9yKSB7XG5cdFx0XHRpZihvbk1pc3NpbmcgJiYgZXJyb3IuY29kZSA9PSBcIkVOT0VOVFwiKSB7XG5cdFx0XHRcdG9uTWlzc2luZyhlcnJvcik7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0aWYoIG9uRXJyb3Ipe1xuXHRcdFx0XHRcdG9uRXJyb3IoIGVycm9yKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRzZWxmLmVuZEVycm9yKCBlcnJvci50b1N0cmluZygpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlIGlmKCBzdGF0cy5pc0RpcmVjdG9yeSgpKSB7XG5cdFx0XHRvbkZvbGRlcihzdGF0cyk7XG5cdFx0fVxuXHRcdGVsc2UgaWYoIHN0YXRzLmlzRmlsZSgpKSB7XG5cdFx0XHRvbkZpbGUoc3RhdHMpO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHNlbGYuZW5kRXJyb3IoIFwiVW5zdXBwb3J0ZWQgRmlsZSBUeXBlXCIpO1xuXHRcdH1cblx0fSk7XG59O1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5lbnN1cmVXb3Jrc3BhY2VFeGlzdHMgPSBmdW5jdGlvbiggY2FsbGJhY2spIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdC8vIGlmIHRoZSB3b3Jrc3BhY2UgaXMgbm90IGluIHRoZSBmaWxlIHN5c3RlbTogZG8gbm90aGluZy5cblx0Ly8gSWYgd2UgY2FsbCB0d2ljZSBjbG9zZS9jbG9zZSBjb21tYW5kIHdlIGRvbid0IHdhbnQgdG8gZGVsZXRlIHRoZSByZWNvcmQgZm9ybSB0aGVcblx0Ly8gdGhlIGRhdGFiYXNlLlxuXHRpZiggc2VsZi5jb21tYW5kID09IENNRF9DTE9TRSkge1xuXHRcdHNlbGYud29ya3NwYWNlRXhpc3RzID0gZnMuZXhpc3RzU3luYyh0aGlzLndvcmtzcGFjZVBhdGgpO1xuXHRcdGNhbGxiYWNrKCk7XG5cdFx0cmV0dXJuO1xuXHR9O1xuXG5cdGlmIChnQXBwU3RvcmFnZSkge1xuXHRcdHdzTG9hZGVyLndhaXRUb0xvYWQoIHNlbGYudWlkLCBzZWxmLndvcmtzcGFjZVBhdGgsIGZ1bmN0aW9uKCl7XG5cdFx0XHRzZWxmLndvcmtzcGFjZUV4aXN0cyA9IGZzLmV4aXN0c1N5bmModGhpcy53b3Jrc3BhY2VQYXRoKTtcblx0XHRcdGNhbGxiYWNrKCk7XG5cdFx0fSk7XG5cdH1cblx0ZWxzZSBpZiggIWlzTG9jYWwpIHtcblx0XHRpZiggIWZzLmV4aXN0c1N5bmMoc2VsZi53b3Jrc3BhY2VQYXRoKSkge1xuXHRcdFx0ZmlsZXV0aWxzLm1rZGlyU3luYyhzZWxmLndvcmtzcGFjZVBhdGgpO1xuXHRcdFx0c2VsZi53b3Jrc3BhY2VFeGlzdHMgPSBmcy5leGlzdHNTeW5jKHNlbGYud29ya3NwYWNlUGF0aCk7XG5cdFx0fVxuXHRcdGNhbGxiYWNrKCk7XG5cdH1cblx0ZWxzZSB7XG5cdFx0Y2FsbGJhY2soKTtcblx0fVxufTtcblxuUmVxdWVzdC5wcm90b3R5cGUuZ2V0Q29udGVudCA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cdHNlbGYuZGlzcGF0Y2goXG5cdFx0ZnVuY3Rpb24oKSB7IC8vIG9uRmlsZVxuXHRcdFx0dmFyIGZuID0gc2VydmVTdGF0aWMoc2VsZi51c2VyUm9vdFBhdGgsIHtkb3RmaWxlcyA6IFwiYWxsb3dcIn0pO1xuXHRcdFx0b25GaW5pc2hlZChzZWxmLnJlcywgZnVuY3Rpb24gKCl7XG5cdFx0XHRcdHNlbGYuY29tcGxldGVkID0gdHJ1ZTtcblx0XHRcdFx0c2VsZi5kb25lKCk7XG5cdFx0XHR9KTtcblx0XHRcdGZuKHNlbGYucmVxLCBzZWxmLnJlcywgZnVuY3Rpb24oZXJyKSB7XG5cdFx0XHRcdGlmKCBlcnIgJiYgZXJyLnRvU3RyaW5nKSB7XG5cdFx0XHRcdFx0c2VsZi5sb2dFcnJvcihcImNvbW1hbmRzXCIsIGVyci50b1N0cmluZygpKTtcblx0XHRcdFx0fTtcblx0XHRcdH0pO1xuXHRcdH0sXG5cdFx0ZnVuY3Rpb24oKSB7IC8vIG9uRm9sZGVyXG5cdFx0XHRzZWxmLmVuZEVycm9yKHNlbGYucGF0aCArIFwiIGlzIGEgZm9sZGVyLlwiKTtcblx0XHR9LFxuXHRcdG51bGwsIC8vIG9uTXNpc2luZ1xuXHRcdGZ1bmN0aW9uKGVycikgeyAvLyBvbkVycm9yXG5cdFx0XHRzZWxmLmVuZEVycm9yKGVycik7XG5cdFx0fVxuXHQpO1xufTtcblxuUmVxdWVzdC5wcm90b3R5cGUucGFjayA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cdHZhciBvcHRpb25zID0gIHtcblx0XHRmcm9tXHRcdDogc2VsZi5wYXRoLFxuXHRcdGlzTG9jYWxcdFx0OiBpc0xvY2FsXG5cdH07XG5cdGNvcHlyb3V0ZS5zZW5kKCBzZWxmLnJlcSwgc2VsZi5yZXMsIG9wdGlvbnMsIHNlbGYpO1xufTtcblxuUmVxdWVzdC5wcm90b3R5cGUuY29weSA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cdHZhciBwYXJzZWRVcmwgPSB1cmwucGFyc2UodGhpcy5yZXEudXJsLCB0cnVlKTtcblx0dmFyIGZyb20gPSBwYXJzZWRVcmwucXVlcnkuZnJvbTtcblx0c2VsZi5sb2dJbmZvKFwiY29tbWFuZHNcIiwgXCJjb3B5IGZyb209J1wiICsgZnJvbSArIFwiJyB0bz0nXCIgKyBzZWxmLnBhdGggKyBcIidcIik7XG5cdHNlbGYuY29tbWFuZElkID0gdXVpZC52NCgpO1xuXHR2YXIgb3B0aW9ucyA9ICB7XG5cdFx0dG9cdFx0XHQ6IHNlbGYucGF0aCxcblx0XHRwb3J0c1x0XHQ6IGdPcHRpb25zLnBvcnRzLFxuXHRcdGlzTG9jYWxcdFx0OiBpc0xvY2FsXG5cdH07XG5cdGNvcHlyb3V0ZS5jb3B5KCBzZWxmLnJlcSwgc2VsZi5yZXMsIG9wdGlvbnMsIHNlbGYpO1xufTtcblxuUmVxdWVzdC5wcm90b3R5cGUuc3RhdHMgPSBmdW5jdGlvbigpIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXHR2YXIgZmlsdGVyID0gZnVuY3Rpb24oIGRhdGEpIHtcblx0XHR2YXIgcHJvcCA9IFtcInNpemVcIiwgXCJhdGltZVwiLCBcIm10aW1lXCIsIFwiY3RpbWVcIl07XG5cdFx0dmFyIHJldCA9IHt9O1xuXHRcdGZvciggdmFyIGkgPSAwOyBpIDwgcHJvcC5sZW5ndGg7ICsraSkge1xuXHRcdFx0aWYoIHR5cGVvZiBkYXRhW3Byb3BbaV1dICE9PSBcInVuZGVmaW5lZFwiKSB7XG5cdFx0XHRcdHJldFtwcm9wW2ldXSA9IGRhdGFbcHJvcFtpXV07XG5cdFx0XHR9O1xuXHRcdH07XG5cdFx0cmV0dXJuIHJldDtcblx0fTtcblxuXHRzZWxmLmRpc3BhdGNoKFxuXHRcdGZ1bmN0aW9uKGRhdGEpIHsgLy9vbkZpbGVcblx0XHRcdHNlbGYuZW5kSlNPTihmaWx0ZXIoZGF0YSkpO1xuXHRcdH0sXG5cdFx0ZnVuY3Rpb24oZGF0YSkgeyAvL29uRm9sZGVyXG5cdFx0XHR2YXIgcmV0ID0gZmlsdGVyKGRhdGEpO1xuXHRcdFx0aWYoIHNlbGYucmVjdXJzaXZlKSB7XG5cdFx0XHRcdGR1KHNlbGYucGF0aCwgZnVuY3Rpb24oZXJyLCBzaXplKSB7XG5cdFx0XHRcdFx0aWYoIGVycikge1xuXHRcdFx0XHRcdFx0c2VsZi5sb2dFcnJvcihcImNvbW1hbmRzXCIsIFwiUmVjdXJzaXZlIFN0YXRzLiBFcnJvciA9IFwiICsgZXJyICsgXCIgUGF0aCA9IFwiICsgc2VsZi5wYXRoKTtcblx0XHRcdFx0XHRcdHNlbGYuZW5kRXJyb3IoZXJyKTtcblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdHJldC5zaXplID0gc2l6ZTtcblx0XHRcdFx0XHRzZWxmLmxvZ0luZm8oXCJjb21tYW5kc1wiLCBcIlJlY3Vyc2l2ZSBTdGF0cy4gU2l6ZSA9IFwiICsgc2l6ZSArIFwiIFBhdGggPSBcIiArIHNlbGYucGF0aCk7XG5cdFx0XHRcdFx0c2VsZi5lbmRKU09OKHJldCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRzZWxmLmVuZEpTT04ocmV0KTtcblx0XHR9LFxuXHRcdGZ1bmN0aW9uKGVycikgeyAvL29uRXJyb3Jcblx0XHRcdHNlbGYuZW5kRXJyb3IoZXJyKTtcblx0XHR9LFxuXHRcdGZ1bmN0aW9uKGVycikgeyAvL29uTWlzc2luZ1xuXHRcdFx0c2VsZi5lbmRFcnJvcihlcnIpO1xuXHRcdH1cblx0KTtcbn07XG5cblJlcXVlc3QucHJvdG90eXBlLmRmID0gZnVuY3Rpb24oKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblx0Y2hpbGRQcm9jZXNzLmV4ZWMoXCJkZiAtLWJsb2NrLXNpemU9MSBcIiArIGdSb290LCBmdW5jdGlvbihlcnJvciwgc3Rkb3V0LCBzdGRlcnIpIHtcblx0XHRpZiAoZXJyb3IgIT0gbnVsbCkge1xuXHRcdFx0c2VsZi5lbmRFcnJvciggZXJyb3IpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHR0cnl7XG5cdFx0XHR2YXIgbGluZXMgPSBzdGRvdXQuc3BsaXQoXCJcXG5cIik7XG5cdFx0XHR2YXIgd29yZHMgPSBsaW5lc1sxXS5zcGxpdCgvXFxzKy8pO1xuXHRcdFx0dmFyIHRvdGFsID0gTnVtYmVyKHdvcmRzWzFdKTtcblx0XHRcdHZhciBhdmFpbGFibGUgPSBOdW1iZXIod29yZHNbM10pO1xuXHRcdFx0dmFyIHdvcmQ0ID0gd29yZHNbNF07XG5cdFx0XHR3b3JkNCA9IHdvcmQ0LnN1YnN0cmluZygwLCB3b3JkNC5sZW5ndGggLSAxKTtcblx0XHRcdHZhciBwZXJjZW50ID0gTnVtYmVyKHdvcmQ0KTtcblx0XHRcdHNlbGYuZW5kSlNPTih7XG5cdFx0XHRcdHRvdGFsOnRvdGFsLFxuXHRcdFx0XHRhdmFpbGFibGU6YXZhaWxhYmxlLFxuXHRcdFx0XHRwZXJjZW50OnBlcmNlbnQsXG5cdFx0XHRcdHdhcm5pbmc6OTVcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRjYXRjaCggZSkge1xuXHRcdFx0c2VsZi5lbmRFcnJvciggZSk7XG5cdFx0fVxuXHR9KTtcbn1cblxuUmVxdWVzdC5wcm90b3R5cGUuZXhpc3RzID0gZnVuY3Rpb24oKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblx0c2VsZi5kaXNwYXRjaChcblx0XHRmdW5jdGlvbihkYXRhKSB7IC8vb25GaWxlXG5cdFx0XHRzZWxmLmVuZFRleHQoXCJ0cnVlXCIpO1xuXHRcdH0sXG5cdFx0ZnVuY3Rpb24oZGF0YSkgeyAvL29uRm9sZGVyXG5cdFx0XHRzZWxmLmVuZFRleHQoXCJ0cnVlXCIpO1xuXHRcdH0sXG5cdFx0ZnVuY3Rpb24oZXJyKSB7IC8vb25FcnJvclxuXHRcdFx0c2VsZi5lbmRUZXh0KFwiZmFsc2VcIik7XG5cdFx0fSxcblx0XHRmdW5jdGlvbihlcnIpIHsgLy9vbk1pc3Npbmdcblx0XHRcdHNlbGYuZW5kVGV4dChcImZhbHNlXCIpO1xuXHRcdH1cblx0KTtcbn07XG5cblJlcXVlc3QucHJvdG90eXBlLmxpc3QgPSBmdW5jdGlvbigpIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXHRzZWxmLmRpc3BhdGNoKFxuXHRcdGZ1bmN0aW9uKCkgeyAvLyBvbkZpbGVcblx0XHRcdHNlbGYuZW5kRXJyb3IoIHNlbGYucGF0aCArXCIgaXMgYSBmaWxlLlwiKTtcblx0XHR9LFxuXHRcdGZ1bmN0aW9uKCkgeyAvLyBvbkZvbGRlclxuXHRcdFx0ZnMucmVhZGRpciggc2VsZi5wYXRoLCBmdW5jdGlvbihlcnJvciwgZmlsZXMpe1xuXHRcdFx0XHRpZiggZXJyb3IpIHtcblx0XHRcdFx0XHRzZWxmLmVuZEVycm9yKCBlcnJvci50b1N0cmluZygpKTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0dmFyIHBhdHRlcm4gPSBudWxsO1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdHBhdHRlcm4gPSBzZWxmLmZpbHRlciA/IG5ldyBSZWdFeHAoc2VsZi5maWx0ZXIpIDogbnVsbDtcblx0XHRcdFx0fVxuXHRcdFx0XHRjYXRjaCggZXJyKSB7XG5cdFx0XHRcdFx0c2VsZi5sb2dFcnJvcihcImNvbW1hbmRzXCIsIGVyci50b1N0cmluZygpKTtcblx0XHRcdFx0XHRzZWxmLmVuZEVycm9yKCBlcnIudG9TdHJpbmcoKSk7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9O1xuXHRcdFx0XHR2YXIgaSA9IDA7XG5cdFx0XHRcdHZhciBkYXRhID0gW107XG5cdFx0XHRcdHZhciBmaWx0ZXJlZEZpbGVzID0gW107XG5cdFx0XHRcdGZvciggaSA9IDA7IGkgPCBmaWxlcy5sZW5ndGg7ICsraSkge1xuXHRcdFx0XHRcdGlmKCAhaXNMb2NhbCAmJiBmaWxlc1tpXSA9PSBTQ1JBVENIX05BTUUpIHtcblx0XHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmKCFwYXR0ZXJuIHx8IHBhdHRlcm4udGVzdChmaWxlc1tpXSkpIHtcblx0XHRcdFx0XHRcdGZpbHRlcmVkRmlsZXMucHVzaChmaWxlc1tpXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9O1xuXHRcdFx0XHR2YXIgdG90YWwgPSBmaWx0ZXJlZEZpbGVzLmxlbmd0aDtcblxuXHRcdFx0XHRpZiggdG90YWwgPT0gMCkge1xuXHRcdFx0XHRcdHNlbGYuZW5kSlNPTiggZGF0YSk7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHZhciBmaWxsZWQgPSAwO1xuXHRcdFx0XHR2YXIgYW55RXJyb3IgPSBudWxsO1xuXHRcdFx0XHR2YXIgZmlsbCA9IGZ1bmN0aW9uKCBpbmRleCkge1xuXHRcdFx0XHRcdHZhciBuYW1lID0gZmlsdGVyZWRGaWxlc1tpbmRleF07XG5cdFx0XHRcdFx0ZGF0YS5wdXNoKHsgbmFtZSA6IG5hbWV9KTtcblx0XHRcdFx0XHRmcy5zdGF0KCBwYXRoLmpvaW4oc2VsZi5wYXRoLCBuYW1lKSwgZnVuY3Rpb24oZXJyLCBzdCkge1xuXHRcdFx0XHRcdFx0aWYoIGVycikge1xuXHRcdFx0XHRcdFx0XHRhbnlFcnJvciA9IGVycjtcblx0XHRcdFx0XHRcdFx0c2VsZi5lbmRFcnJvciggZXJyLnRvU3RyaW5nKCkpO1xuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdGlmKCBhbnlFcnJvcikge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRkYXRhW2luZGV4XS5pc0RpcmVjdG9yeSA9IHN0LmlzRGlyZWN0b3J5KCk7XG5cdFx0XHRcdFx0XHRkYXRhW2luZGV4XS5zaXplID0gc3Quc2l6ZTtcblx0XHRcdFx0XHRcdGRhdGFbaW5kZXhdLmF0aW1lID0gc3QuYXRpbWU7XG5cdFx0XHRcdFx0XHRkYXRhW2luZGV4XS5jdGltZSA9IHN0LmN0aW1lO1xuXHRcdFx0XHRcdFx0ZGF0YVtpbmRleF0ubXRpbWUgPSBzdC5tdGltZTtcblx0XHRcdFx0XHRcdCsrZmlsbGVkO1xuXHRcdFx0XHRcdFx0aWYoIGZpbGxlZCA+PSB0b3RhbCkge1xuXHRcdFx0XHRcdFx0XHRzZWxmLmVuZEpTT04oIGRhdGEpO1xuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fTtcblx0XHRcdFx0Zm9yKCBpID0gMDsgaSA8IHRvdGFsOyArK2kpIHtcblx0XHRcdFx0XHRmaWxsKCBpKTtcblx0XHRcdFx0fTtcblx0XHRcdH0pO1xuXHRcdH1cblx0KTtcbn07XG5cblJlcXVlc3QucHJvdG90eXBlLnB1dENvbnRlbnQgPSBmdW5jdGlvbigpIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXHRzZWxmLnRlbXBVcGxvYWRQYXRoID0gbnVsbDtcblx0c2VsZi51bmxpbmtPcmlnaW5hbEZpbGUgPSBmYWxzZTtcblx0dmFyIGZpbGwgPSBmdW5jdGlvbigpIHtcblx0Ly8vLyBUT0RPIC0gbWFrZSBzdXJlIHdlIGRvbid0IGV4Y2VlZCB0aGUgcXVvdGEuXG5cdC8vLy8gVE9ETyAtIGlmIHdlIHJlYWNoIDkwJSBvZiB0aGUgcXVvdGEgZmlyZSBhbiBldmVudCB0byB0aGUgcHJveHkgdGhhdCAodWlkLGFwcCx3b3Jrc3BhY2UpIGhhcyByZWFjaGVkIHRoZWlyIGxpbWl0LlxuXG5cdFx0dmFyIHN0cmVhbSA9IGZzLmNyZWF0ZVdyaXRlU3RyZWFtKHNlbGYudGVtcFVwbG9hZFBhdGgpO1xuXHRcdHZhciByZXF1ZXN0RW5kZWQgPSBmYWxzZTtcblx0XHR2YXIgZmlsZUNsb3NlZCA9IGZhbHNlO1xuXG5cdFx0dmFyIGFsbENvbXBsZXRlZCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0Ly8gVGhlIHJlcXVlc3QgaXMgYWxyZWFkeSBjb21wbGV0ZWQuIERvIG5vdGhpbmcuXG5cdFx0XHRpZiggc2VsZi5jb21wbGV0ZWQpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBXYWl0IGZvciBib3RoIGZpbGUgJ2Nsb3NlJyBhbmQgcmVxdWVzdCAnZW5kJyBldmVudHMgdG8gZmlyZS5cblx0XHRcdGlmKCAhZmlsZUNsb3NlZCB8fCAhcmVxdWVzdEVuZGVkKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0Ly8gd2hlbiBhIGZpbGUgaXMgbmV3IHdlIGRvIG5vdCBjcmVhdGUgYSB0ZW1wb3JhcnkgZmlsZS5cblx0XHRcdHZhciBkb05vdERlbGV0ZUFueXRoaW5nID0gZnVuY3Rpb24oIHBhdGgsIGNhbGxiYWNrKSB7XG5cdFx0XHRcdGNhbGxiYWNrKCk7XG5cdFx0XHR9O1xuXHRcdFx0dmFyIGRlbGV0ZUZ1bmN0aW9uID0gc2VsZi51bmxpbmtPcmlnaW5hbEZpbGUgPyBmcy51bmxpbmsgOiBkb05vdERlbGV0ZUFueXRoaW5nO1xuXHRcdFx0ZGVsZXRlRnVuY3Rpb24oIHNlbGYucGF0aCwgZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0aWYoIHNlbGYuY29tcGxldGVkKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9O1xuXHRcdFx0XHRpZiggZXJyb3IpIHtcblx0XHRcdFx0XHRzZWxmLmxvZ0Vycm9yKFwiY29tbWFuZHNcIiwgXCJQVVQgXCIgKyBzZWxmLnBhdGggKyBcIiBjYW5ub3Qgb3ZlcnJpZGUgZmlsZS5cIik7XG5cdFx0XHRcdFx0c2VsZi5lbmRFcnJvcihcImNhbm5vdCBvdmVycmlkZSBmaWxlIFwiICsgc2VsZi5wYXRoKTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH07XG5cdFx0XHRcdGZzLnJlbmFtZSggc2VsZi50ZW1wVXBsb2FkUGF0aCwgc2VsZi5wYXRoLCBmdW5jdGlvbiggZXJyb3IpIHtcblx0XHRcdFx0XHRpZiggc2VsZi5jb21wbGV0ZWQpIHtcblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdGlmKCBlcnJvcikge1xuXHRcdFx0XHRcdFx0c2VsZi5sb2dFcnJvcihcImNvbW1hbmRzXCIsIFwiUFVUIFwiICsgc2VsZi50ZW1wVXBsb2FkUGF0aCArIFwiIGNhbm5vdCByZW5hbWUgZmlsZS5cIik7XG5cdFx0XHRcdFx0XHRzZWxmLmVuZEVycm9yKFwiY2Fubm90IHJlbmFtZSBmaWxlIFwiICsgc2VsZi50ZW1wVXBsb2FkUGF0aCk7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRzZWxmLmxvZ0luZm8oXCJjb21tYW5kc1wiLCBcIlBVVCBcIiArIHNlbGYucGF0aCArIFwiIGVuZGVkLlwiKTtcblx0XHRcdFx0XHRzZWxmLmVuZE9LKCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0c3RyZWFtLm9uKFwiY2xvc2VcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHRmaWxlQ2xvc2VkID0gdHJ1ZTtcblx0XHRcdGFsbENvbXBsZXRlZCgpO1xuXHRcdH0pO1xuXG5cdFx0c2VsZi5yZXEub24oXCJlbmRcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXF1ZXN0RW5kZWQgPSB0cnVlO1xuXHRcdFx0YWxsQ29tcGxldGVkKCk7XG5cdFx0fSk7XG5cblx0XHQvLyBIYW5kbGUgZmlsZSBzdHJlYW0gZXhjZXB0aW9ucy5cblx0XHQvLyBUbyBzaW11bGF0ZTogSnVzdCBiZWZvcmUgdGhlIGZpbGUgaXMgb3BlbmVkIGluIGNyZWF0ZVdyaXRlU3RyZWFtLCBjcmVhdGUgYSB+ZmlsZSBhbmQgbWFrZSBpdCByZWFkLW9ubHkuXG5cdFx0c3RyZWFtLm9uKFwiZXJyb3JcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyBUaGUgcmVxdWVzdCBpcyBhbHJlYWR5IGNvbXBsZXRlZC4gRG8gbm90aGluZy5cblx0XHRcdGlmKCBzZWxmLmNvbXBsZXRlZCkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9O1xuXHRcdFx0c2VsZi5sb2dFcnJvcihcImNvbW1hbmRzXCIsIFwiUFVUIFwiICsgc2VsZi50ZW1wVXBsb2FkUGF0aCArIFwiIGNhbm5vdCBvcGVuIGZpbGUgZm9yIHdyaXRpbmcuXCIpO1xuXHRcdFx0c2VsZi5lbmRFcnJvcihcImNhbm5vdCBvcGVuIGZpbGUgZm9yIHdyaXRpbmcgXCIgKyBzZWxmLnRlbXBVcGxvYWRQYXRoKTtcblx0XHR9KTtcblxuXHRcdC8vIHRoZSBjb25uZWN0aW9uIGhhcyBjbG9zZWQgYmVmb3JlIHVwbG9hZGVkIGNvbXBsZXRlZC4gUmVtb3ZlIHRoZSB0ZW1wIHVwbG9hZCBmaWxlIGFuZCByZXR1cm4gZXJyb3IuXG5cdFx0Ly8gVG8gc2ltdWxhdGU6IEluICd3b3Jrc3BhY2V0ZXN0Y2xpZW50JyB1c2UgdGhlIGZ1bmN0aW9uIGdlbmVyYXRlTG9uZ1RleHQoKSwgcHJlc3MgJ1B1dCcgYnV0dG9uIGFuZCBjbG9zZSB0aGUgYnJvd3Nlci5cblx0XHRpZiAocHJvY2Vzcy52ZXJzaW9ucy5ub2RlLnNwbGl0KCcuJylbMF0gPD0gMTQpIHsgLy8gaHR0cHM6Ly9qaXJhLml0Zy50aS5jb20vYnJvd3NlL0dDLTMxMjdcblx0XHRcdHNlbGYucmVxLm9uKFwiY2xvc2VcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyBUaGUgcmVxdWVzdCBpcyBhbHJlYWR5IGNvbXBsZXRlZC4gRG8gbm90aGluZy5cblx0XHRcdFx0aWYoIHNlbGYuY29tcGxldGVkKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9O1xuXHRcdFx0XHRmcy51bmxpbmsoIHNlbGYudGVtcFVwbG9hZFBhdGgsIGZ1bmN0aW9uKCBlcnJvcikge1xuXHRcdFx0XHRcdGlmKCBzZWxmLmNvbXBsZXRlZCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0c2VsZi5sb2dFcnJvcihcImNvbW1hbmRzXCIsIFwiUFVUIFwiICsgc2VsZi50ZW1wVXBsb2FkUGF0aCArIFwiIGNvbmVuY3Rpb24gY2xvc2VkIGJ5IGNsaWVudC5cIik7XG5cdFx0XHRcdFx0c2VsZi5lbmRFcnJvciggc2VsZi5wYXRoICtcIiBjb25lbmN0aW9uIGNsb3NlZCBieSBjbGllbnQuXCIpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHNlbGYucmVxLnBpcGUoc3RyZWFtKTtcblx0fTtcblx0c2VsZi5kaXNwYXRjaChcblx0XHRmdW5jdGlvbigpIHsgLy8gb25GaWxlXG5cdFx0XHRzZWxmLnVubGlua09yaWdpbmFsRmlsZSA9IHRydWU7XG5cdFx0XHRzZWxmLnNldFRlbXBVcGxvYWRQYXRoKCBmdW5jdGlvbiggZXJyb3IpIHtcblx0XHRcdFx0aWYoIGVycm9yKSB7XG5cdFx0XHRcdFx0Ly8gc2V0VGVtcFVwZGFsb2FkTmFtZSBhbHJlYWR5IHJlcGxpZWQgd2l0aCBlcnJvci5cblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH07XG5cdFx0XHRcdGZpbGwoKTtcblx0XHRcdH0pO1xuXHRcdH0sXG5cdFx0ZnVuY3Rpb24oKSB7IC8vIG9uRm9sZGVyXG5cdFx0XHRzZWxmLmVuZEVycm9yKCBzZWxmLnBhdGggK1wiIGFscmVhZHkgZXhpc3RzIGFzIGZvbGRlci5cIik7XG5cdFx0fSxcblx0XHRmdW5jdGlvbigpIHsgLy8gb25Nc2lzaW5nXG5cdFx0XHRzZWxmLnVubGlua09yaWdpbmFsRmlsZSA9IGZhbHNlO1xuXHRcdFx0dmFyIHBhcmVudCA9IHBhdGguZGlybmFtZSggc2VsZi5wYXRoKTtcblx0XHRcdGZpbGV1dGlscy5ta2RpclN5bmMocGFyZW50KTtcblx0XHRcdC8vIHRoZSBmaWxlIGRvZXMgbm90IGV4aXN0IGhlcmUuXG5cdFx0XHRzZWxmLnNldFRlbXBVcGxvYWRQYXRoKCBmdW5jdGlvbiggZXJyb3IpIHtcblx0XHRcdFx0aWYoIGVycm9yKSB7XG5cdFx0XHRcdFx0Ly8gc2V0VGVtcFVwZGFsb2FkTmFtZSBhbHJlYWR5IHJlcGxpZWQgd2l0aCBlcnJvci5cblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH07XG5cdFx0XHRcdGZpbGwoKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0KTtcbn07XG5cblJlcXVlc3QucHJvdG90eXBlLnNldFRlbXBVcGxvYWRQYXRoID0gZnVuY3Rpb24oIGNhbGxiYWNrKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblx0dmFyIHBhcmVudCA9IHBhdGguZGlybmFtZSggc2VsZi5wYXRoKTtcblx0dmFyIGZpbGVOYW1lID0gcGF0aC5iYXNlbmFtZSggc2VsZi5wYXRoKTtcblx0ZnVuY3Rpb24gbmFtZUV4aXN0cyggbmFtZSwgZmlsZXMpIHtcblx0XHRmb3IoIHZhciBpID0gMDsgaSA8IGZpbGVzLmxlbmd0aDsgKytpKSB7XG5cdFx0XHRpZiggZmlsZXNbaV0gPT0gbmFtZSlcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fTtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH07XG5cblx0ZnMucmVhZGRpciggcGFyZW50LCBmdW5jdGlvbihlcnJvciwgZmlsZXMpe1xuXHRcdGlmKCBlcnJvcikge1xuXHRcdFx0c2VsZi5sb2dFcnJvcihcImNvbW1hbmRzXCIsIFwiUFVUIFwiICsgc2VsZi5wYXRoICsgXCIgZW5kZWQgd2l0aCBlcnJvcjpcIiArIGVycm9yLnRvU3RyaW5nKCkpO1xuXHRcdFx0c2VsZi5lbmRFcnJvciggZXJyb3IudG9TdHJpbmcoKSk7XG5cdFx0XHRjYWxsYmFjayggZXJyb3IpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH07XG5cdFx0dmFyIHByZWZpeCA9IFwiflwiO1xuXHRcdHdoaWxlKCBuYW1lRXhpc3RzKHByZWZpeCArIGZpbGVOYW1lLCBmaWxlcykpIHtcblx0XHRcdHByZWZpeCArPSBcIn5cIjtcblx0XHR9O1xuXHRcdHNlbGYudGVtcFVwbG9hZFBhdGggPSBwYXRoLmpvaW4ocGFyZW50LCBwcmVmaXggKyBmaWxlTmFtZSk7XG5cdFx0Y2FsbGJhY2soKTtcblx0fSk7XG59O1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5kZWxldGVJdGVtID0gZnVuY3Rpb24oKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblx0c2VsZi5kaXNwYXRjaChcblx0XHRmdW5jdGlvbigpIHsgLy8gb25GaWxlXG5cdFx0XHRmcy51bmxpbmsoc2VsZi5wYXRoLCBmdW5jdGlvbiAoZXJyKSB7XG5cdFx0XHRcdGlmKCBlcnIpIHtcblx0XHRcdFx0XHRzZWxmLmVuZEVycm9yKCBlcnIudG9TdHJpbmcoKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0c2VsZi5lbmRPSygpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9LFxuXHRcdGZ1bmN0aW9uKCkgeyAvLyBvbkZvbGRlclxuXHRcdFx0ZmlsZXV0aWxzLnJtZGlyU3luYyhzZWxmLnBhdGgpO1xuXHRcdFx0c2VsZi5lbmRPSygpO1xuXHRcdH1cblx0KTtcbn07XG5cblJlcXVlc3QucHJvdG90eXBlLnJlbmFtZSA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cdGlmKCAhc2VsZi50bykge1xuXHRcdHNlbGYuZW5kRXJyb3IoIFwiSW52YWxpZCBwYXJhbWV0ZXIuXCIpO1xuXHRcdHJldHVybjtcblx0fTtcblx0dmFyIGJvdGggPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgdG9QYXRoID0gcGF0aC5qb2luKHBhdGguZGlybmFtZShzZWxmLnBhdGgpLCBzZWxmLnRvKTtcblx0XHRmcy5zdGF0KCB0b1BhdGgsIGZ1bmN0aW9uKGVycm9yLCBzdGF0cykge1xuXHRcdFx0aWYoZXJyb3IgJiYgZXJyb3IuY29kZSA9PSBcIkVOT0VOVFwiKSB7XG5cdFx0XHRcdGZzLnJlbmFtZShzZWxmLnBhdGgsIHRvUGF0aCwgZnVuY3Rpb24oIGVycm9yKSB7XG5cdFx0XHRcdFx0aWYoIGVycm9yKSB7XG5cdFx0XHRcdFx0XHRzZWxmLmVuZEVycm9yKCBlcnJvci50b1N0cmluZygpKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHRzZWxmLmVuZE9LKCk7XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0c2VsZi5lbmRFcnJvciggXCJGaWxlIFwiK3NlbGYudG8rXCIgYWxyZWFkeSBleGlzdHMuXCIpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9O1xuXHRzZWxmLmRpc3BhdGNoKCBib3RoLCBib3RoKTtcbn07XG5cblJlcXVlc3QucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblx0aWYoICFzZWxmLnRvKSB7XG5cdFx0c2VsZi5lbmRFcnJvciggXCJJbnZhbGlkIHBhcmFtZXRlci5cIik7XG5cdFx0cmV0dXJuO1xuXHR9O1xuXG5cdHZhciB0b1BhdGggPSBwYXRoLmpvaW4ocGF0aC5kaXJuYW1lKHNlbGYucGF0aCksIHNlbGYudG8pO1xuXHR2YXIgYm90aCA9IGZ1bmN0aW9uKCkge1xuXHRcdG5jcChzZWxmLnBhdGgsIHRvUGF0aCwgZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdGlmKCBlcnJvcikge1xuXHRcdFx0XHRzZWxmLmVuZEVycm9yKCBlcnJvci50b1N0cmluZygpKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fTtcblx0XHRcdHNlbGYuZW5kT0soKTtcblx0XHR9KTtcblx0fTtcblxuXHRmcy5zdGF0KCB0b1BhdGgsIGZ1bmN0aW9uKGVycm9yLCBzdGF0cykge1xuXHRcdGlmKGVycm9yICYmIGVycm9yLmNvZGUgPT0gXCJFTk9FTlRcIikge1xuXHRcdFx0c2VsZi5kaXNwYXRjaCggYm90aCwgYm90aCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fTtcblx0XHRpZiggZXJyb3IpIHtcblx0XHRcdHNlbGYuZW5kRXJyb3IoIGVycm9yLnRvU3RyaW5nKCkpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRzZWxmLmVuZEVycm9yKCBcIlJlc291cmNlIFwiICsgc2VsZi50bytcIiBhbHJlYWR5IGV4aXN0cy5cIik7XG5cdH0pO1xufTtcblxuUmVxdWVzdC5wcm90b3R5cGUuY3JlYXRlSXRlbSA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cdHNlbGYuZGlzcGF0Y2goXG5cdFx0ZnVuY3Rpb24oKSB7IC8vIG9uRmlsZVxuXHRcdFx0c2VsZi5lbmRFcnJvciggc2VsZi5wYXRoICtcIiBGaWxlIGFscmVhZHkgZXhpc3QuXCIpO1xuXHRcdH0sXG5cdFx0ZnVuY3Rpb24oKSB7IC8vIG9uRm9sZGVyXG5cdFx0XHRzZWxmLmVuZEVycm9yKCBzZWxmLnBhdGggK1wiIEZvbGRlciBhbHJlYWR5IGV4aXN0LlwiKTtcblx0XHR9LFxuXHRcdGZ1bmN0aW9uKCkgeyAvLyBvbk1pc3Npbmdcblx0XHRcdGlmKCBzZWxmLmRpcmVjdG9yeSkge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdGZpbGV1dGlscy5ta2RpclN5bmMoc2VsZi5wYXRoKTtcblx0XHRcdFx0XHRzZWxmLmVuZE9LKCk7XG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHRzZWxmLmVuZEVycm9yKGUudG9TdHJpbmcoKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRmcy5vcGVuKCBzZWxmLnBhdGgsIFwid3hcIiwgZnVuY3Rpb24gKGVyciwgZmQpIHtcblx0XHRcdFx0XHRpZiggZXJyKSB7XG5cdFx0XHRcdFx0XHRzZWxmLmVuZEVycm9yKCBlcnJvci50aW9TdHJpbmcoKSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdCAgICBmcy5jbG9zZShmZCwgZnVuY3Rpb24gKGVycikge1xuXHRcdFx0XHRcdCAgICBcdGlmKGVycikge1xuXHRcdFx0XHRcdCAgICBcdFx0c2VsZi5lbmRFcnJvciggZXJyb3IudGlvU3RyaW5nKCkpO1xuXHRcdFx0XHRcdCAgICBcdH1cblx0XHRcdFx0XHQgICAgXHRlbHNlICB7XG5cdFx0XHRcdFx0ICAgIFx0XHRzZWxmLmVuZE9LKCk7XG5cdFx0XHRcdFx0ICAgIFx0fTtcblx0XHRcdFx0XHQgICAgfSk7XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9O1xuXHRcdH1cblx0KTtcbn07XG5cbi8vVElDTEQtMTg5M1xudmFyIFNDUkFUQ0hfTkFNRSA9IFwiLnNjcmF0Y2hfMTc2NFwiO1xuLy9lbmQgVElDTEQtMTg5M1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cdHNlbGYubG9nSW5mbyhcImNvbW1hbmRzXCIsIFwiQ0xPU0UgXCIgKyBzZWxmLndvcmtzcGFjZU5hbWUpO1xuXHRpZiggIWdBcHBTdG9yYWdlKSB7XG5cdFx0c2VsZi5lbmRPSygpO1xuXHRcdHJldHVybjtcblx0fTtcblx0Ly8gSWYgd2UgY2FsbCB3b3Jrc3BhY2Ugc2Vjb25kIHRpbWUgdGhlIHRlbXAgc3RvcmFnZSB3aWxsIGJlIHJlbW92ZWRcblx0Ly8gdGhpcyBpcyBjb25zaWRlcmVkIG5vcm1hbCBjb25kaXRpb24sIHdlIHNob3VsZCBub3QgdHJ5IHRvIG92ZXJyaWRlIHRoZSBkYXRhYmFzZSBhbmQgcmV0dXJuIE9LLlxuXHRpZiggIXNlbGYud29ya3NwYWNlRXhpc3RzKSB7XG5cdFx0c2VsZi5lbmRPSygpO1xuXHRcdHJldHVybjtcblx0fTtcblxuLy8gVElDTEQtMTg5M1xuXHR2YXIgc2NyYXRjaEZvbGRlciA9IHBhdGguam9pbiggc2VsZi53b3Jrc3BhY2VQYXRoLCBTQ1JBVENIX05BTUUpO1xuXHRmaWxldXRpbHMucmVtb3ZlSXRlbShzY3JhdGNoRm9sZGVyLCBmdW5jdGlvbigpIHtcbi8vIGVuZCBUSUNMRC0xODkzXG5cdFx0Z0FwcFN0b3JhZ2Uuc3RvcmUoc2VsZi51aWQsIHNlbGYud29ya3NwYWNlUGF0aCwgbnVsbCxcblx0XHRcdG51bGwsXG4vL1x0XHRcdHBhcmFtcy5zZXNzaW9uSWQsICAvLyBUT0RPIC0gYWRkIHRoZSBzZXNzaW9uSUQgLSBpdCBpcyBvbmx5IHVzZWQgaW4gdGhlIGxvZ2dpbmcuXG5cdFx0XHRmdW5jdGlvbihlcnIpIHtcblx0XHRcdFx0aWYoZXJyKSB7XG5cdFx0XHRcdFx0c2VsZi5lbmRFcnJvcihlcnIudG9TdHJpbmcoKSk7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHNlbGYuZW5kT0soKTtcblx0XHRcdH0sXG4vL1x0XHRcdHtcInNlc3Npb25JZFwiOiBwYXJhbXMuYnJvd3NlclNlc3Npb25JZH0gIC8vIFRPRE8gLSBhZGQgdGhlIGJyb3dzZXIgc2Vzc2lvbklEIC0gaXQgaXMgb25seSB1c2VkIGluIHRoZSBsb2dnaW5nLlxuXHRcdFx0bnVsbFxuXHRcdCk7XG5cdH0pO1xufTtcblxuLy8gaHR0cHM6Ly9qaXJhLml0Zy50aS5jb20vYnJvd3NlL0dDLTEwNTVcblJlcXVlc3QucHJvdG90eXBlLnN0b3JlID0gZnVuY3Rpb24oKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblx0c2VsZi5sb2dJbmZvKFwiY29tbWFuZHNcIiwgXCJzdG9yZSBcIiArIHNlbGYud29ya3NwYWNlTmFtZSk7XG5cblx0aWYoICFnQXBwU3RvcmFnZSkge1xuXHRcdHNlbGYuZW5kT0soKTtcblx0XHRyZXR1cm47XG5cdH07XG5cblx0Z0FwcFN0b3JhZ2Uuc3RvcmUoc2VsZi51aWQsIHNlbGYud29ya3NwYWNlUGF0aCwgbnVsbCxcblx0XHRudWxsLFxuLy9cdFx0XHRwYXJhbXMuc2Vzc2lvbklkLCAgLy8gVE9ETyAtIGFkZCB0aGUgc2Vzc2lvbklEIC0gaXQgaXMgb25seSB1c2VkIGluIHRoZSBsb2dnaW5nLlxuXHRcdGZ1bmN0aW9uKGVycikge1xuXHRcdFx0aWYoZXJyKSB7XG5cdFx0XHRcdHNlbGYuZW5kRXJyb3IoZXJyLnRvU3RyaW5nKCkpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRzZWxmLmVuZE9LKCk7XG5cdFx0fSxcbi8vXHRcdFx0e1wic2Vzc2lvbklkXCI6IHBhcmFtcy5icm93c2VyU2Vzc2lvbklkfSAgLy8gVE9ETyAtIGFkZCB0aGUgYnJvd3NlciBzZXNzaW9uSUQgLSBpdCBpcyBvbmx5IHVzZWQgaW4gdGhlIGxvZ2dpbmcuXG5cdFx0bnVsbCxcblx0XHR0cnVlLFxuXHRcdFNDUkFUQ0hfTkFNRVxuXHQpO1xufTtcblxuUmVxdWVzdC5wcm90b3R5cGUubWV0YSA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cdHNlbGYubG9nSW5mbyhcImNvbW1hbmRzXCIsIFwibWV0YSB3a3MgPSBcIiArIHNlbGYud29ya3NwYWNlTmFtZSArXCIgcGFyYW1zID0gXCIgKyBKU09OLnRvU3RyaW5nKHNlbGYubWV0YVBhcmFtcykpO1xuXHR2YXIgcmV0ID0ge307XG5cdGlmKCBzZWxmLm1ldGFQYXJhbXMucXVlcnlEQkJhY2t1cEZhaWxlZCkge1xuXHRcdHZhciBmaWxlUGF0aCA9IHBhdGguam9pbihzZWxmLndvcmtzcGFjZVBhdGgsIFwiLm1ldGFkYXRhXCIsIFwiREJCYWNrdXBGYWlsZWRcIik7XG5cdFx0ZnMuc3RhdCggZmlsZVBhdGgsIGZ1bmN0aW9uKCBlcnJvciwgc3RhdCkge1xuXHRcdFx0cmV0LnF1ZXJ5REJCYWNrdXBGYWlsZWQgPSAoIGVycm9yICYmIGVycm9yLmNvZGUgPT0gXCJFTk9FTlRcIikgPyBmYWxzZSA6IHRydWU7XG5cdFx0XHRpZiggcmV0LnF1ZXJ5REJCYWNrdXBGYWlsZWQgJiYgc2VsZi5tZXRhUGFyYW1zLmNsZWFyRmxhZykge1xuXHRcdFx0XHRmcy51bmxpbmsoIGZpbGVQYXRoLCBmdW5jdGlvbihlcnIpIHtcblx0XHRcdFx0XHRzZWxmLmVuZEpTT04oIHJldCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRzZWxmLmVuZEpTT04oIHJldCk7XG5cdFx0fSk7XG5cdFx0cmV0dXJuO1xuXHR9XG5cdHNlbGYuZW5kSlNPTiggcmV0KTtcbn07XG4vLyBlbmQgaHR0cHM6Ly9qaXJhLml0Zy50aS5jb20vYnJvd3NlL0dDLTEwNTVcblxuUmVxdWVzdC5wcm90b3R5cGUuaXNDb21wbGV0ZWQgPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIHRoaXMuY29tcGxldGVkO1xufTtcblxuUmVxdWVzdC5wcm90b3R5cGUuZW5kRXJyb3IgPSBmdW5jdGlvbihtc2cpIHtcblx0aWYoIHRoaXMuaW50ZXJuYWxDb21tYW5kKSB7XG5cdFx0dGhpcy5pbnRlcm5hbEVycm9yID0gbXNnO1xuXHR9O1xuXHR0aGlzLmVuZEpTT04oe21zZzogbXNnLCBjb2RlOiAtMX0sIDQwNCk7XG59O1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5lbmRPSyA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLmVuZFRleHQoXCJPS1wiKTtcbn07XG5cblJlcXVlc3QucHJvdG90eXBlLmVuZFRleHQgPSBmdW5jdGlvbih0ZXh0LCBzdGF0dXMpIHtcblx0dGhpcy5jb21wbGV0ZWQgPSB0cnVlO1xuXHRpZiggdGhpcy5yZXMpIHtcblx0XHR0aGlzLnJlcy53cml0ZUhlYWQoc3RhdHVzID8gc3RhdHVzIDogMjAwLCB7J0NvbnRlbnQtVHlwZSc6ICd0ZXh0L2pzb24nfSk7XG5cdFx0dGhpcy5yZXMuZW5kKHRleHQpO1xuXHR9XG5cdHRoaXMuZG9uZSgpO1xufTtcblxuUmVxdWVzdC5wcm90b3R5cGUuZW5kSlNPTiA9IGZ1bmN0aW9uKG9iaiwgc3RhdHVzKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblx0c2VsZi5jb21wbGV0ZWQgPSB0cnVlO1xuXHRpZiggc2VsZi5yZXMpIHtcblx0XHR0cnl7XG5cdFx0XHRzZWxmLnJlcy53cml0ZUhlYWQoc3RhdHVzID8gc3RhdHVzIDogMjAwLCB7J0NvbnRlbnQtVHlwZSc6ICd0ZXh0L2pzb24nfSk7XG5cdFx0XHRzZWxmLnJlcy5lbmQoSlNPTi5zdHJpbmdpZnkob2JqKSk7XG4vLyBodHRwczovL2ppcmEuaXRnLnRpLmNvbS9icm93c2UvVElDTEQtMjE2M1xuLy8gSW4gcmFyZSBjYXNlcyB3aGVuIHRoZSBoZWFkZXIgaXMgYXJlYWR5IHNlbnQgd2UgZG9uJ3Qgd2FudCB0aGUgcHJvY2VzcyB0byBlbmQuXG4vLyBJIGhhdmUgbm90IHRlc3RlZCBpZiB0aGlzIGV4Y2VwdGlvbiBpcyB0aHJvd24gbXV0aXBsZSB0aW1lcy5cblx0XHR9Y2F0Y2goIGVycm9yKSB7XG5cdFx0XHRzZWxmLmxvZ0Vycm9yKFwiY29tbWFuZFwiLCBcImVuZEpTT04gZXhjZXB0aW9uLiBDb21tbmFkID0gXCIgKyBzZWxmLmNvbW1hbmQgKyBcIiBFeGNlcHRpb24gPSBcIiArIGVycm9yKTtcblx0XHR9XG5cdH1cblx0dGhpcy5kb25lKCk7XG59O1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5vbk1heFRpbWUgPSBmdW5jdGlvbigpIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXHRzZWxmLmxvZ0Vycm9yKFwiY29tbWFuZFwiLCBcIlRpbWVyIGV4cGlyZWQuIENvbW1uYWQgPSBcIiArIHNlbGYuY29tbWFuZCArIFwiIFBhdGggXCIgKyBzZWxmLnBhdGgpO1xuXHRpZiggc2VsZi5pc0NvbXBsZXRlZCgpKSB7XG5cdFx0cmV0dXJuO1xuXHR9O1xuXHR0aGlzLmVuZEVycm9yKCBcIlRpbWVvdXQuXCIpO1xufTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogV2Vic2VydmVyXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuZXhwb3J0cy5zdGFydCA9IGZ1bmN0aW9uKGxvZywgb3B0aW9ucywgY2FsbGJhY2spIHtcblx0Z0xvZyA9IGxvZztcblx0Z1Jvb3QgPSBvcHRpb25zLnJvb3Q7XG5cdGdPcHRpb25zID0gb3B0aW9ucztcblx0aXNMb2NhbCA9ICEhb3B0aW9ucy5pc0xvY2FsO1xuXG5cdHZhciBzZWxmID0gdGhpcztcblx0dmFyIHNlcnZlciA9IGh0dHAuY3JlYXRlU2VydmVyKGZ1bmN0aW9uKHJlcSwgcmVzKSB7XG5cdFx0Ly8gTGV0IHRoZSBzdGF0dXMgcmVzcG9uZGVyIGhhbmRsZSB0aGlzIHJlcXVlc3QuXG5cdFx0Ly8gV2Ugc2hvdWxkIHByZXZlbnQgdGhlIHVzZXIgZnJvbSBjcmVhdGluZyB3b3Jrc3BhY2UgY2FsbGVkIHN0YXR1cyB3aGVuIHdlIGhhdmUgdGhlc2UgQVBJLlxuXHRcdGlmKCByZXEudXJsLmluZGV4T2YoXCIvc3RhdHVzL1wiKSA9PT0gMCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH07XG5cdFx0aWYoIHF1aWVzY2VkKSB7XG5cdFx0XHRyZXMud3JpdGVIZWFkKDQwNCwgeydDb250ZW50LVR5cGUnOiAndGV4dC9qc29uJ30pO1xuXHRcdFx0cmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IG1zZyA6IFwiSW52YWxpZCBzZXJ2ZXIgc3RhdGU6IHF1aWVzY2VkLlwifSkpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH07XG5cdFx0dmFyIHIgPSBuZXcgUmVxdWVzdCgpO1xuXHRcdHIuaW5pdChyZXEsIHJlcyk7XG5cdFx0aWYoIGdBY3Rpdml0eVdhdGNoZXIpIHtcblx0XHRcdGdBY3Rpdml0eVdhdGNoZXIub25OZXdSZXF1ZXN0KHIpO1xuXHRcdH07XG5cdFx0ci5leGVjdXRlKCk7XG5cdH0pO1xuXHRleHBvcnRzLmh0dHBTZXJ2ZXIgPSBzZXJ2ZXI7XG5cblx0aWYgKHR5cGVvZiBvcHRpb25zLnBvcnQgIT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRzZXJ2ZXIubGlzdGVuKG9wdGlvbnMucG9ydCwgJzAuMC4wLjAnLCAzMCwgZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0aWYoIGVycm9yKSB7XG5cdFx0XHRcdHJldHVybiBjYWxsYmFjayhlcnJvcik7XG5cdFx0XHR9XG5cdFx0XHRjYWxsYmFjayhudWxsLCBzZXJ2ZXIuYWRkcmVzcygpLnBvcnQpO1xuXHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdGxpc3RlbihzZXJ2ZXIsIGNhbGxiYWNrKTtcblx0fVxufTtcblxuZXhwb3J0cy5hZGRBcHBTdG9yYWdlID0gZnVuY3Rpb24oYXBwU3RvcmFnZSkge1xuXHRnQXBwU3RvcmFnZSA9IGFwcFN0b3JhZ2U7XG59O1xuXG4vLyBUT0RPIG9uY2UgdGhlIG5ldyBjb3B5IGlzIHVzZWQgcmVtb3ZlIHRoaXMuXG5leHBvcnRzLmFkZFNlYXBvcnRzID0gZnVuY3Rpb24oc2VhcG9ydHMpIHtcblx0Z1NlYXBvcnRzID0gc2VhcG9ydHM7XG59O1xuXG4vLyBUT0RPIG9uY2Ugd2UgbW92ZSB0byBuZXcgY29weSByZW1vdmUgdGhpcy5cbmV4cG9ydHMuc2V0Q29weVNyY0Jhc2VEaXIgPSBmdW5jdGlvbihkaXJlY3RvcnkpIHtcblx0Z0NvcHlTcmNCYXNlRGlyID0gZGlyZWN0b3J5O1xufTtcblxuZXhwb3J0cy5zZXRBY3Rpdml0eVdhdGNoZXIgPSBmdW5jdGlvbiggd2F0Y2hlcikge1xuXHRnQWN0aXZpdHlXYXRjaGVyID0gd2F0Y2hlcjtcbn07XG5cbnZhciBxdWllc2NlZCA9IGZhbHNlO1xuXG5leHBvcnRzLnF1aWVzY2UgPSBmdW5jdGlvbigpIHtcblx0cXVpZXNjZWQgPSB0cnVlO1xufVxuXG52YXIgaW5zdHJ1bWVudGF0aW9uID0ge1xuXHRkZWxheSA6IDAsXG5cdGRlZmF1bHRNYXhUaW1lIDogMTIwMDAwLFxuXHRtYXhUaW1lIDogMTIwMDAwLFxuXG5cdHNldERlbGF5IDogZnVuY3Rpb24obXMpIHtcblx0XHR0aGlzLmRlbGF5ID0gbXM7XG5cdH0sXG5cdHNldE1heFRpbWUgOiBmdW5jdGlvbihtcykge1xuXHRcdHRoaXMubWF4VGltZSA9IG1zID8gbXMgOiB0aGlzLmRlZmF1bHRNYXhUaW1lO1xuXHR9LFxuXHRfYXJyYXlDb3VudCA6IGZ1bmN0aW9uKCBhcnIsIHdvcmtzcGFjZVBhdGgpIHtcblx0XHQvLyByZXR1cm4gYWxsIGZvciB0ZXN0aW5nLlxuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRpZiggIXdvcmtzcGFjZVBhdGgpIHtcblx0XHRcdHZhciByZXQgPSAwO1xuXHRcdFx0T2JqZWN0LmtleXMoYXJyKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuXHRcdFx0XHRyZXQgKz0gc2VsZi5fYXJyYXlDb3VudChhcnIsIGtleSk7XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiByZXQ7XG5cdFx0fTtcblx0XHRpZiggYXJyW3dvcmtzcGFjZVBhdGhdICYmIGFyclt3b3Jrc3BhY2VQYXRoXS5sZW5ndGgpIHtcblx0XHRcdHJldHVybiBhcnJbd29ya3NwYWNlUGF0aF0ubGVuZ3RoO1xuXHRcdH07XG5cdFx0cmV0dXJuIDA7XG5cdH0sXG5cdGRlZmZlcmVkUmVxdWVzdENvdW50IDogZnVuY3Rpb24oIHdvcmtzcGFjZVBhdGgpIHtcblx0XHRyZXR1cm4gdGhpcy5fYXJyYXlDb3VudCggUmVxdWVzdC5wcm90b3R5cGUuZGVmZXJyZWRSZXFzLCB3b3Jrc3BhY2VQYXRoKTtcblx0fSxcblx0Y3VycmVudFJlcXVlc3RDb3VudCA6IGZ1bmN0aW9uKCB3b3Jrc3BhY2VQYXRoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2FycmF5Q291bnQoIFJlcXVlc3QucHJvdG90eXBlLmN1cnJlbnRSZXFzLCB3b3Jrc3BhY2VQYXRoKTtcblx0fSxcblx0aGFzT3V0c3RhbmRpbmdSZXF1ZXN0cyA6IGZ1bmN0aW9uKHdvcmtzcGFjZVBhdGgpIHtcblx0XHR2YXIgdG90YWwgPSB0aGlzLmRlZmZlcmVkUmVxdWVzdENvdW50KHdvcmtzcGFjZVBhdGgpICtcdHRoaXMuY3VycmVudFJlcXVlc3RDb3VudCh3b3Jrc3BhY2VQYXRoKTtcblx0XHRyZXR1cm4gdG90YWwgPiAwO1xuXHR9XG59O1xuZXhwb3J0cy5pbnN0cnVtZW50YXRpb24gPSBpbnN0cnVtZW50YXRpb247XG5cbmV4cG9ydHMuY2xvc2VXb3Jrc3BhY2UgPSBmdW5jdGlvbih1aWQsIGZvbGRlciwgY2FsbGJhY2spIHtcblx0dmFyIHIgPSBuZXcgUmVxdWVzdCgpO1xuXHRyLmluaXRJbnRlcm5hbENsb3NlKHVpZCwgZm9sZGVyLCBjYWxsYmFjayk7XG5cdHIuZXhlY3V0ZSgpO1xufTtcbiIsbnVsbCxudWxsXSwibmFtZXMiOlsib3B0aW1pc3QiLCJwYXRoIiwiaG9tZWRpciIsInBsYXRmb3JtIiwiZXhwcmVzcyIsInJlcXVpcmUkJDAiLCJyZXF1aXJlJCQxIiwicmVxdWlyZSQkMiIsImZzIiwiaHRtbHBhcnNlciIsIldyaXRhYmxlIiwiRXZlbnRFbWl0dGVyIiwiZmlsZXV0aWxzIiwiZGVjb21wcmVzcyIsImZldGNoIiwidGFyIiwiYXJjaGl2ZXIiLCJnbG9iIiwicm1kaXJTeW5jIiwiVkVSX1JFR0VYIiwiaHR0cFByb3h5Iiwib3MiLCJxdWVyeXN0cmluZyIsInVybCIsIkpTT041IiwiVGV4dERlY29kZXIiLCJjaGlsZFByb2Nlc3MiLCJodHRwIiwicmVxdWlyZSQkMyIsInJlcXVpcmUkJDQiLCJyZXF1aXJlJCQ1IiwicmVxdWlyZSQkNiIsInJlcXVpcmUkJDciLCJoZWxwZXIiLCJyZXF1aXJlJCQ4IiwicmVxdWlyZSQkOSIsInJlcXVpcmUkJDEwIiwicmVxdWlyZSQkMTEiLCJyZXF1aXJlJCQxMiIsInJlcXVpcmUkJDEzIiwicmVxdWlyZSQkMTQiLCJyZXF1aXJlJCQxNSIsIm9wZW4iLCJzdGFydF93b3Jrc3BhY2VzZXJ2ZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTRDQSxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUM7QUFDMUIsTUFBTSxnQkFBZ0IsR0FBRyxXQUFXLENBQUM7QUFDckMsTUFBTSxpQkFBaUIsR0FBRyxZQUFZLENBQUM7QUFDaEMsTUFBTSxhQUFhLEdBQUcsU0FBUyxDQUFDO0FBQ2hDLE1BQU0sT0FBTyxHQUFHQSw0QkFBUSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQVcsSUFBSSxFQUFFLENBQUM7QUFDN0QsTUFBTSxTQUFTLEdBQUcsV0FBVyxDQUFDO0FBQzlCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBRTlDOzs7QUFHTyxNQUFNLGNBQWMsR0FBRyxDQUFDLEdBQVc7SUFDdEMsTUFBTSxNQUFNLEdBQUcsTUFBTUMsd0JBQUksQ0FBQyxJQUFJLENBQUNDLFVBQU8sRUFBRSxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUM5RCxNQUFNLFFBQVEsR0FBRyxNQUFNRCx3QkFBSSxDQUFDLElBQUksQ0FBQ0MsVUFBTyxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDdkQsTUFBTSxNQUFNLEdBQUcsTUFBTUQsd0JBQUksQ0FBQyxJQUFJLENBQUNDLFVBQU8sRUFBRSxFQUFFLFNBQVMsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO0lBQzVFLE1BQU0sVUFBVSxHQUFHLE1BQU1DLFdBQVEsRUFBRSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxNQUFNLEVBQUUsR0FBRyxRQUFR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
