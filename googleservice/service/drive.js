
const { google } = require("googleapis");
const stream = require("stream");
const fs = require("fs");

/** 
 * @param { String | {} } credential - Google service key path or credential object.
 */
function GoogleDrive( credential ) {
    
    if ( !this ) throw new Error("GoogleDrive must be invoked with the 'new' keyword.");

	credential = typeof credential === "string" ? fs.existsSync( credential ) && require( credential ) : typeof credential === "object" && credential;

	if ( !credential ) throw new Error("Invalid or missing Google service key. Please provide a valid service key path or credential object.")
	
    const auth = new google.auth.GoogleAuth({
		credentials, scopes: ["https://www.googleapis.com/auth/drive.file","https://www.googleapis.com/auth/drive.resource"]
	});

	const GoogleDrive = google.drive({ version:'v3', auth });
    
    /**
     * 
     * @param { File } file - The file object to be uploaded.
     * @returns { Buffer }
     **/
    const bufferStream = function BufferFileStream( file ) {
        const buffer = new stream.PassThrough();
        buffer.end( file.buffer || file.data );
        return buffer
    }

    /**
     * Uploads a file to Google Drive.
     * @param { File } file - The file object to be uploaded.
     * @param { String | [] } filter - The field parameter for the API request.
     * @returns { Promise<Object> } - A promise resolving to the API response.
     */
	this.set = function GoogleDriveFileUpload( file, filter ) {
	    
	    const fields = typeof filter === "string" ? filter : ( Array.isArray( filter ) ? filter.join(",") : "*" );
	    
	    return new Promise( resolve => {
	        
	        if ( !file || ( !file.data && !file.buffer ) ) resolve( null );
	        
	        const media = {
    			mimeType: file.mimetype,
    			body: bufferStream( file )
    		};
    		
    		const resource = {
    			name: Date.now().toString(),
    			parents: ['1-sQEbClcbj6xmywa5XygM3wWfGCWWF69']
    		};
    		
    		const fileResult = Object.fromEntries(
    		    Object.entries( file ).filter( ([ key, value ]) => !Buffer.isBuffer( value ) )
    		);
    		
    		GoogleDrive.files.create({ resource, media, fields })
    		    .then( response => {
    		        response.data.fileoriginal = fileResult;
    		        resolve( response.data )
    		    })
    		    .catch( error => resolve( null ) );
    		
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
	        GoogleDrive.files.get( filter )
	            .then( response => resolve( response.data ) )
	            .catch( error => resolve(null) )
	    })
	}
	
}

module.exports = GoogleDrive;
