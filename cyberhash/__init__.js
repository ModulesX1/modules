/*
 * Cyberhash v1.0.0 ( beta )
 * Copyright 2023 The Modulesx1 Authors
 * Licensed under MIT ( https://github.com/ModulesX1/Cyberhash/blob/main/LICENSE )
 */

const crypto = require("crypto");

Buffer.encode = function( message ) {
    if ( message === 'undefined' ) return Buffer.from([]);
    if ( typeof message === 'object' || Array.isArray( message ) ) message = JSON.stringify( message );
    return Buffer.from( String( message ), 'utf-8' )
}
/**	
 * @param { String } message - Text to encode.
 * @param { String } secret - Secret key ( Optional )
 * @return { String }
 **/
module.exports = function cyberhas( message, secret ) {
    const inital = secret ? crypto.createHmac( 'sha3-256', secret ) : crypto.createHash('sha3-256');
    inital.update( Buffer.encode( message ) );
    return inital.digest('hex')
}