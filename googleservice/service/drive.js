
const { google } = require("googleapis");
const stream = require("node:stream");
const fs = require("node:fs");

/** 
 * @param { String | {} } credential - Google service key path or credential object.
 */
function GoogleDrive( credential ) {
    
    if ( !this ) throw new Error("GoogleDrive must be invoked with the 'new' keyword.");

	const credentials = typeof credential === "string" ? fs.existsSync( credential ) && require( credential ) : typeof credential === "object" && credential;

	if ( !credentials ) throw new Error("Invalid or missing Google service key. Please provide a valid service key path or credential object.")
	
    const auth = new google.auth.GoogleAuth({
		credentials, scopes: ["https://www.googleapis.com/auth/drive.file","https://www.googleapis.com/auth/drive.resource"]
	});

	const GoogleDriveApi = google.drive({ version:'v3', auth });
    
    /**
     * 
     * @param { File } file - The file object to be uploaded.
     * @returns { Buffer }
     **/
    const bufferStream = function BufferFileStream( file ) {
        if ( file instanceof fs.ReadStream ) return file;
        const buffer = new stream.PassThrough();
        buffer.end( Buffer.isBuffer( file ) ? file : file.buffer || file.data );
        return buffer
    }
    
    const driveUserContent = async function GoogleDriveFileContentLink(initialUrl) {
        try {
            const response = await fetch( `https://drive.google.com/uc?id=${initialUrl}`, { redirect:'manual' });
            if ( response.status >= 300 && response.status < 400 ) {
                return response.headers.get('location');
            } else {
                return initialUrl;
            }
        } catch(e) {
            return null;
        }
    }

    /**
     * Uploads a file to Google Drive.
     * @param { File } file - The file object to be uploaded.
     * @param { String | [] } filter - The field parameter for the API request.
     * @returns { Promise<Object> } - A promise resolving to the API response.
     */
	this.create = function GoogleDriveFileUpload( file, filter ) {
	    
	    const fields = typeof filter === "string" ? ( filter.includes("id") ? filter : "id," + filter ) : ( Array.isArray( filter ) ? ( filter.join(",").includes("id") ? filter.join(",") : "id," + filter.join(",") ) : "*" );
	    
	    return new Promise( resolve => {
	        
	        if ( !file || ( !file.data && !file.buffer && !Buffer.isBuffer( file ) ) ) resolve( null );
	        
    		const resource = {
    			name: Date.now().toString(),
    			parents: ['1-sQEbClcbj6xmywa5XygM3wWfGCWWF69']
    		};
    		
    		GoogleDriveApi.files.create({ resource, media:{ body:bufferStream( file ) }, fields })
    		    .then( response => {
    		        driveUserContent( res.data.id )
    		            .then( link => {
    		                res.data.webContentLink = link;
    		                resolve( res.data );
    		            }).catch( err => resolve( null ) );
    		    })
    		    .catch( err => resolve( null ) );
	    })
	}
	
	/**
	 * Get a file from Google Drive.
	 * @param { String } fileId - Google drive file id.
	 * @param { Object } options - Google drive filter options.
	 * @param { String } [options.fields] - File fields filter.
	 * @returns { Promise<Object> }
	 **/
	this.get = function GoogleDriveFileGet( fileId, options ) {
	    return new Promise( resolve => {
	        const filter = { fileId };
	        typeof options === "object" && Object.assign( filter, options );
	        GoogleDriveApi.files.get( filter )
	            .then( response => resolve( response.data ) )
	            .catch( error => resolve(null) )
	    })
	}
	
}

module.exports = GoogleDrive;
