//import required packages
const express = require( 'express' );
require( 'dotenv' ).config()
const bodyParser = require( 'body-parser' );
const app = express();
const port = 3000;
const jwt = require( 'jsonwebtoken' );
const multer = require('multer');
const {parse} = require( 'csv-parse' );
var fs = require( 'fs' ); 


app.use(bodyParser.urlencoded({ extended: false }));
app.use( bodyParser.json() );

//setting up MondoDB
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://jkjarvis:${process.env.MONGO_PASSWORD}@cluster0.efpblhe.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient( uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 } );
const users= client.db( "test" ).collection( "users" );
const contacts= client.db( "test" ).collection( "contacts" );


//function acting as middleware to verify JWT for a given access token
function verifyJWT(req, res, next) {
  // Get the JWT from the request header
  var token = req.headers['x-access-token'];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // Verify the JWT
  jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
  });
}


//function to let a user login with given username and password and obtain a JWT token
app.post( '/login', function ( req, res )
{
  // Verify the user's credentials
  const user = users.findOne( { email: req.body.username, password: req.body.password } ).catch( ( err ) =>
  {
    return res.status( 401 ).json( { message: 'Invalid email or password', err: err } );
  } )
  // Generate a JWT
  var token = jwt.sign( { _id: user._id }, process.env.JWT_SECRET, { expiresIn: '2d' } );

  // Return the JWT
  res.json( { token } );
} );




//function to let a user create an account (simply storing username and password) and store the details in database
app.post( '/create-user', function ( req, res )
{
  console.log(req.body)
    if ( req.body.username && req.body.password )
    {
        const user = { username: req.body.username, password: req.body.password };
        users.insertOne( user );
    }
  
  res.send( 'created' );
} )




// Set up multer to handle the file upload
const upload = multer({ dest: './tmp/csv-uploads' });

//function to let an authenticated user upload the contact csv file and parse the file and upload required contents to db
app.post('/upload-contacts', [verifyJWT, upload.single('contacts')], function(req, res) {
  // Parse the CSV file
  
  fs.createReadStream( req.file.path, 'utf8' )
  .pipe( parse( { delimiter: ",", from_line: 2 } ) )
    .on( "data", function ( row )
    {
      console.log( row );
      const data = {
        name: row[ 0 ],
        phone: row[ 1 ],
        email: row[ 2 ],
        linkedinProfileUrl: row[3]
      }
      contacts.insertOne( data );
  })
  .on("end", function () {
    console.log("finished");
  })
  .on("error", function (error) {
    console.log(error.message);
  } );
  
  res.send("success")
  
});




app.listen(port, () => {
  console.log(`Listening..`);
} );