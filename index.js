import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "username",
  host: "localthos",
  database: "your database name",
  password: "password",
  port: 5432
});

db.connect();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));



//HomePage route
app.get('/', async (req, res) => {

  //Fetch all entries from the database
  const result = await db.query("SELECT country_code, country_name, date, story FROM journalentry");
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });

  let JournalEntry = [];
  //Fetch all journal entries
  result.rows.forEach((entry) => {
    JournalEntry.push({
      country_name: entry.country_name,
      date: entry.date,
      story: entry.story
    });
  });
  res.render('index.ejs', {entries: JournalEntry, countries: countries});
});

//Form submition
app.post('/add', async (req, res) => {
  //Get country name, date and story from the form
    const country_name =req.body['country'];
    const date = req.body['date'];
    const story = req.body['story'];

  //Check if the country name exists in the database
    const result = await db.query(
      "SELECT country_code FROM countries WHERE country_name = $1", [country_name]
    );
    
    if(result.rows.length !== 0) {
        //Get country code from the result
        const countryCode = result.rows[0].country_code; 
        //Insert new journal entry into the database
        await db.query(
          "INSERT INTO journalentery (country_code, country_name, date, story) VALUES ($1, $2, $3, $4)", 
          [countryCode, country_name, date, story]
        );
        res.redirect('/');
    } 
});

//listener
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
