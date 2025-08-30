groq```
*[_type == "article"] | order(_id) [100...200] {
  _id, title, body
}
```

groq```
*[_type == "article"] | order(_id) [0...100] {
  _id, title, body
}
```

groq```
*[_type == "article" && _id > $lastId] | order(_id) [0...100] {
  _id, title, body
}
```

groq```
publishedAt > $lastPublishedAt
```

groq```
*[_type == "article"] | order(publishedAt) [0...100] {
  _id, title, body, publishedAt
}
```

groq```
*[_type == "post" && (
  publishedAt > $lastPublishedAt
  || (publishedAt == $lastPublishedAt && _id > $lastId)
)] | order(publishedAt) [0...100] {
  _id, title, body, publishedAt
}
```

groq```
count(*[_type == "post"])
```

groq```
*[_type == "article" && _id > $lastId][$index]._id
```

groq```
*[_type == 'post' &&
  !(_id in path("drafts.**")) &&
  includeInSitemap != false &&
  publishedAt < now()] | order(publishedAt desc) {
    slug
  }
```

groq```
*[_type == "presenter"][0]{
  name,
  title
}
```

groq```
*[_type == "presenter"][0]{
  name,
  "title": title.en
}
```

groq```
*[_type == "presenter"][0]{
  name,
  "title": coalesce(title.sv, title.en, "Missing translation")
}
```

groq```
*[_type == "presenter"][0]{
  name,
  "title": coalesce(title[$language], title[$baseLanguage], "Missing translation")
}
```

groq```
*[_type == "presenter"][0]{
  name,
  "title": title[_key == "en"][0].value
}
```

groq```
*[_type == "presenter"][0]{
  name,
  "title": coalesce(
    title[_key == "en"][0].value,
    title[_key == "nl"][0].value,
    "Missing translation"
  )
}
```

groq```
*[_type == "presenter"][0]{
  name,
  "title": coalesce(
    title[_key == $language][0].value,
    title[_key == $baseLanguage][0].value,
    "Missing translation"
  )
}
```

groq```
*[_type == "lesson" && language == $language]{
  title,
  slug,
  language,
  // Get the translations metadata
  // And resolve the `value` reference field in each array item
  "_translations": *[_type == "translation.metadata" && references(^._id)].translations[].value->{
    title,
    slug,
    language
  },
}
```

groq```
// Fetch all documents
*[]
```

groq```
// Only fetch documents where the '_type' field equals 'product'
*[_type == "product"]
```

groq```
// This cannot be optimized, because the order expression uses string concatenation
*[_type == "person"] {
  firstName, lastName
} | order(firstName + " " + lastName)
```

groq```
// Fetch all documents
// ...then filter down to those where salePrice is less than displayPrice
*[salePrice < displayPrice]
```

groq```
// Direct-use of the parent operator is optimized
*[_type == "person"] {
  _id, parent,
  "siblings": *[_type == ^._type && parent._ref == ^._id] 
}
```

groq```
// String concatenation of the operator is not optimized 
* { _id, "draft": *[_id == "drafts." + ^._id] }
```

groq```
count(*[_type == "person" && isPublished])
```

groq```
// Not optimizable, because it uses == with a computed expression count
(*[_type == "person" && (firstName + " " + lastName) == "Ronald McDonald"])
```

groq```
* | order(name)
```

groq```
// Deep index
*[_type == "article"][10000]
```

groq```
// Deep slice
*[_type == "article"][10000..10100]
```

groq```
*[slug.current == "discounted"]._id
```

groq```
// Only fetch documents where:
// the '_type' field equals 'product' and it has a 'salePrice' field
// ...then filter down to those where salePrice is less than displayPrice
*[_type == "product" && salePrice != null && salePrice < displayPrice]
```

groq```
// Fetch all categories titles and parents:
*[_type == "category"] {
  title,
  parent->
}
```

groq```
// ...is the same as:
*[_type == "category"] {
  title,
  "parent": *[_id == ^.parent._ref][0] 
}
```

groq```
// Slow, repeated subquery
*[_type == "category"] {
  title,
  "slug": slug.current,
  "parentTitle": parent->title, 
  "parentSlug": parent->slug.current
}
```

groq```
// Merge a single subquery into the root level of the result
*[_type == "category"] {
  title,
  "slug": slug.current,
  ...(parent-> {
    "parentTitle": title,
    "parentSlug": slug.current
  }) 
}
```

groq```
*[_type == "post" && author->name == "Bob Woodward"]
```

groq```
*[_type == "post" && vertical->slug.current == "football"]
```

groq```
*[_type == "post" && vertical._ref == "football"]
```

groq```
*[_type == "product"]{
  // Resolves much more metadata that you probably need
  image->,

  // The url of a full size unoptimized image
  "imageUrl": image->asset.url,

  // Just get the image _ref and dynamically create the URL
  image
}
```

groq```
// Sorting on a projected attribute
*[_type == "person"] {
  "name": firstName + " " + lastName,
  "isBoss": role->name == "boss",
} | order(isBoss, name)
```

groq```
// Filtering on a projected attribute
*[_type == "person"] {
  "isBoss": role->name == "boss",
}[isBoss == true]
```

groq```
*[_type == "article"] | order(_id)[1000..1020]
```

groq```
*[_type == "article" && _id > $lastId] | order(_id)[0..20]
```

groq```
{
  "topPosts": *[_type == "post" && category == $category]
    | order(popularity desc)[0..30],
  "news": *[_type == "news"] | order(_createdAt desc)[0..10],
  "user": *[_type == "user" && _id == $id],
}
```

groq```
*[_type == 'movie' && releaseYear >= 1979]
```

groq```
*[_type == 'movie' && releaseYear >= 1979]{ _id, title, releaseYear }
```

groq```
*[_type == 'movie' && releaseYear >= 1979] | order(releaseYear) {
  _id, title, releaseYear 
}
```

groq```
*[_type == 'movie' && releaseYear >= 1979] | order(releaseYear) {
  _id, title, releaseYear
}[0...100]
```

groq```
*[_type == 'movie' && releaseYear >= 1979]{
  _id, title, releaseYear
}
```

groq```
*[_type == 'movie' && releaseYear >= 1979]{
  _id, title, releaseYear,
  director
}
```

groq```
*[_type == 'movie' && releaseYear >= 1979]{
  _id, title, releaseYear,
  director->
}
```

groq```
*[_type == 'movie' && releaseYear >= 1979]{
  _id, title, releaseYear,
  director->{name}
}
```

groq```
*[_type == 'movie' && releaseYear >= 1979]{
  _id, title, releaseYear,
  "directorName": director->name
}
```

groq```
*[_type == 'movie' && releaseYear >= 1979]{
  _id, title, releaseYear, director,
  producers[]
}
```

groq```
*[_type == 'movie' && releaseYear >= 1979]{
  _id, title, releaseYear, director,
  producers[]->
}
```

groq```
*[_type == 'movie' && references('ridley-scott')]
```

groq```
*[_type == "person"]{
  _id, name,
  "movies": *[_type == "movie" && references(^._id)].title
}
```

groq```
*[_type == "movie" && references(^._id)]{title}
```

groq```
*[_type == "movie" && references(^._id)].title
```

groq```
*[_type == "project"]{
  _id, title,
  "status": milestones|order(year desc)[0].status
}
```

groq```
*[_type == "project"]{
  _id, title,
  "completed": count(milestones[status == 'completed']) > 0
}
```

groq```
*[_type == "project"]{
  _id, title,
  "status": milestones | order(year desc)[0].status
}
```

groq```
*[_type == "movie"]{
  title,
  "posterImage": poster.asset->url
}
```

groq```
*[_type == "movie"]{
  title,
  "imageUrls": images[].asset->url
}
```

groq```
*[_type == "movie"]{
  title,
  "images": images[]{
    caption,
    "url": asset->url,
  }
}
```

groq```
*[_type == "movie"]{
  "actorCount": count(actors)
}
```

groq```
*[_type == "movie"]{
  "actorCount": count(actors),
  ...
}
```

groq```
*[]{
  ...,
  'age': 45 // This will override the age property
            // returned from the ellipsis, so age == 45
}
```

groq```
*[]{
  'age': 45,
  ... // The age value returned from the ellipsis does *not*
      // override the explicitly set value, so age == 45
}
```

groq```
*[]{
  'age': 45,
  ... // The age value returned from the ellipsis *does*
      // override the explicitly set value, so age == 23
}
```

groq```
count(*)
```

groq```
count(*[name match "sigourney"]) > 0
```

groq```
{
  "mainStory": *[_id == "story-1234"],
  "campaign": *[_id == "campaign-1234"],
  "topStories": *[_type == "story"] | order(publishAt desc) [0..10]
}
```

groq```
*[_type == "property"]{
  name, 
  description, 
  "beds": string(beds),
  "bathrooms": string(bathrooms)
}
```

groq```
releases::all()
```

groq```
releases::all()[state == 'active']
```

groq```
*[_type == "movie"] {
  ...,
  "actors": actors[]{
    ...
    person->
  }
}
```

groq```
*[_type=="person"]{
  name,
  "relatedMovies": *[_type=='movie' && references(^._id)]{ 
  	title,
  	slug,
  	releaseDate
	}
}
```

groq```
*[_type == "post"]{
  ...,
  body[]{
    ...,
    markDefs[]{
      ...,
      _type == "internalLink" => {
        "slug": @.reference->slug
      }
    }
  }
}
```

groq```
*[ _type == "director" && birthYear >= 1970 ]{
  name,
  birthYear,
  "movies": *[ _type == "movie" && director._ref == ^._id ]
}
```

groq```
{
  // Comments can be on a separate line
  "key": "value" // Or at the end of a line
}
```

groq```
*[ category == "news" ]
```

groq```
// @ refers to the current number being evaluated
// Returns numbers in the array if they're greater than or equal to 10
numbers[ @ >= 10 ]
```

groq```
// @ refers to the myArray value
// This query returns the number of items in the myArray array
*{"arraySizes": myArray[]{"size": count(@)}}
```

groq```
*[ _type == "movie" && releaseYear >= 2000 ]{
  title,
  releaseYear,
  crew{name, title},
  "related": *[ _type == "movie" && genre == ^.genre ]
}
```

groq```
_id
```

groq```
*[_type ==  'author'] {
  "authorName": lastName,
  "booksWritten": *[_type == 'book' && references(^._id)].title
}
```

groq```
genre
```

groq```
*[ _type == "movie" && releaseYear >= 1980]
```

groq```
*[ _type == "book" ]{
  title,
  "authors": authors[]{
    "name": firstName + " " + lastName,
    birthYear,
  }
}
```

groq```
{
  name,
  role == "director" => {
    "movies": *[ _type == "movie" && director._ref == ^._id ]
  }
}
```

groq```
pt::text(ptNode)
```

groq```
// If title.es exists return title.es
// Else return title.en
// If neither exist, return null
*[_type == "documentWithTranslations"]{
  "title": coalesce(title.es, title.en)
}
```

groq```
// If rating exists, return rating,
// Else return string of 'unknown'
*[_type == 'movie']{
  'rating': coalesce(rating, 'unknown')
}
```

groq```
count(*[_type == 'movie' && rating == 'R'])
```

groq```
*[_type == "post"]{
  title,
  publishedAt,
  "timeSincePublished": dateTime(now()) - dateTime(publishedAt)
}
```

groq```
// Returns all documents if awardWinner has any value (of any type)
*[defined(awardWinner)]
```

groq```
// Return posts with more than 2 authors
*[_type == "post" && length(authors) > 2]{
  title,
  authors[]->{
    name
  }
}
```

groq```
*{
  "upperString": upper("Some String"), // Returns "SOME STRING"
  "lowerString": lower("Some String")  // Returns "some string" 
}
```

groq```
// Give me all posts with a publish date in the future
*[_type == "post" && dateTime(now()) < dateTime(publishedAt)]
```

groq```
// _id matches a.b.c.d but not a.b.c.d.e
*[_id in path("a.b.c.*")]
```

groq```
// _id matches a.b.c.d and a.b.c.d.e
*[_id in path("a.b.c.**")]
```

groq```
// All draft documents
*[_id in path("drafts.**")]
```

groq```
// Only published documents
*[!(_id in path("drafts.**"))]
```

groq```
// Using the ^ operator to refer to the enclosing document. Here ^._id refers to the id
// of the enclosing person record.
*[_type=="person"]{
  name,
  "relatedMovies": *[_type=='movie' && references(^._id)]{ title }
}
```

groq```
"child"
```

groq```
@->{
name,
price
}
```

groq```
{
  "stringInteger": string(21),         // Returns "21"
  "stringFloat": string(3.14159),      // Returns "3.14159"
  "stringSciNotation": string(3.6e+5), // Returns "360000"
  "stringTrue": string(true),          // Returns "true"
  "stringFalse": string(false),        // Returns "false"
  "stringString": string("A string"),  // Returns "A string"
}
```

groq```
*[0] {
  'secondsAgo': dateTime(now()) - dateTime(_createdAt),
} {
  'minutesSinceCreated': 'Created ' + string(secondsAgo / 60) + ' minutes ago.'
}
```

groq```
// Let's imagine a document with a year field,
// which contains a four-digit number – in this example, 2009
*[0] {
  year    // Returns 2009
}
```

groq```
// To compare year to a datetime field, such as now(), _createdAt,
// or _updatedAt, the year field must be converted to a string in RFC3339 format,
// but trying to append a string to the year field returns null
*[0] {
  'constructedYear': year + "-01-01T00:00:00Z"    // Returns null
}
```

groq```
// Using the string() function, year can be coerced to a string
// and structured in RFC3339 format
*[0] {
  'constructedYear': string(year) + "-01-01T00:00:00Z"    // Returns "2009-01-01T00:00:00Z"
}
```

groq```
// In this way, the year field can be used to perform time arithmetic operations
*[0] {
  'secondsSinceYear': dateTime(now()) - dateTime(string(year) + "-01-01T00:00:00Z")
}
```

groq```
// Returns the body Portable Text data as plain text
*[_type == "post"] 
  { "plaintextBody": pt::text(body) }
```

groq```
// Scores posts by the amount of times the string "GROQ"
// appears in a Portable Text field
*[_type == "post"]
  | score(pt::text(body) match "GROQ")
```

groq```
{
  'projectId': sanity::projectId(),  // Returns 'hm31oq0j', for example
  'dataset': sanity::dataset()       // Returns 'production', for example
}
```

groq```
array::join(1234, ".")
```

groq```
array::join([1, 2, 3], 1)
```

groq```
array::join(["a", "b", c, "d"], ".")
```

groq```
// Returns [1, 2, 3]
array::compact([1, null, 2, null, 3])
```

groq```
// Returns [1, 2, 3, 4, 5]
array::unique([1, 2, 2, 2, 3, 4, 5, 5])
```

groq```
array::intersects([1, 2, 3], ['foo', 'bar', 'baz'])
```

groq```
math::avg([1, 2, 3, 4, "5"])
```

groq```
math::max([1, "10", 100, 1000])
```

groq```
math::max([])
```

groq```
math::min([1, "10", 100, 1000])
```

groq```
math::min([])
```

groq```
math::sum([1, 2, 3, 4, "5"])
```

groq```
math::sum([])
```

groq```
string::startsWith("alphabet", "")
```

groq```
string::startsWith("alphabet", "bet")
```

groq```
string::split("abc", "")
```

groq```
string::split(12, "1")
```

groq```
string::split("This is 1 way to do it", 1)
```

groq```
* | score(title match "Red", title match "Fish")
```

groq```
* | score(title match "Red" && title match "Fish")
```

groq```
* | score(title match "Red Fish")
```

groq```
// Adds points to the score value depending 
// on the use of the string "GROQ" in each post's description 
// The value is then used to order the posts 
*[_type == "post"] 
  | score(description match "GROQ") 
  | order(_score desc) 
  { _score, title }
```

groq```
// Adds a point for matches in the title OR description
*[_type == "post"] 
  | score(title match "GROQ" || description match "GROQ") 
  | order(_score desc) 
  { _score, title }
```

groq```
// Orders blog posts by GROQ matches
// Then filters the results for only items that matched
// by checking for _score values greater than 0
*[_type == "post"] 
  | score(description match "GROQ") 
  | order(_score desc) 
  { _score, title }
  [ _score > 0 ]
```

groq```
// Adds 1 to the score for each time $term is matched in the title field
// Adds 3 to the score if (movie > 3) is true
*[_type == "movie" && movieRating > 3] | 
  score(
    title match $term,
    boost(movieRating > 8, 3)
  )
```

groq```
// Creates a scoring system where $term matching in the title
// is worth more than matching in the body
*[_type == "movie" && movieRating > 3] | score(
  boost(title match $term, 4),
  boost(body match $term, 1),
  boost(movieRating > 8, 3)
)
```

groq```
// Scores games by the "impressive" difference in goals
*[_type == "game"] | score(
		boost(pointDifference > 5, 5),
		boost(pointDifference > 10, 10)
	)
```

groq```
// Boosts _score for matches in the title OR description,
// but a match on the description now has less of an impact on _score
*[_type == "post"] 
  | score(title match "GROQ" || boost(description match "GROQ", 0.3)) 
  | order(_score desc) 
  { _score, title }
```

groq```
// This is equivalent
*[_type == "system.release"]
```

groq```
*[title in ["Aliens", "Interstellar", "Passengers"]]
```

groq```
*[title match "wo*"]
```

groq```
*["caterpillar" match animal + "*"]
```

groq```
*[[title, body] match ["wo*", "zero"]]
```

groq```
*[body[].children[].text match "aliens"]
```

groq```
*[_type == "movie"] | order(releaseDate desc) | order(_createdAt asc)
```

groq```
*[_type == "todo"] | order(priority desc, _updatedAt desc)
```

groq```
*[_type == "movie"] | order(_createdAt asc)[0]
```

groq```
*[_type == "movie"] | order(_createdAt desc)[0]
```

groq```
*[_type == "movie"] | order(_createdAt asc)[0..9]
```

groq```
*[_type == "movie"][0..9] | order(_createdAt asc)
```

groq```
// Fetch movies with title, and join with poster asset with path + url
*[_type=='movie']{title,poster{asset->{path,url}}}
```

groq```
// Say castMembers is an array containing objects with character name and a reference to the person:
// We want to fetch movie with title and an attribute named "cast" which is an array of actor names
*[_type=='movie']{title,'cast': castMembers[].person->name}
```

groq```
// Same query as above, except "cast" now contains objects with person._id and person.name
*[_type=='movie']{title,'cast': castMembers[].person->{_id, name}}
```

groq```
// Books by author.name (book.author is a reference)
*[_type == "book" && author._ref in *[_type=="author" && name=="John Doe"]._id ]{...}
```

groq```
{
// People ordered by Nobel prize year
"peopleByPrizeYear": *[]|order(prizes[0].year desc){
"name": firstname + " " + surname,
"orderYear": prizes[0].year,
prizes
},
// List of all prizes ordered by year awarded
"allPrizes": *[].prizes[]|order(year desc)
}
```

groq```
// return only title
*[_type == 'movie']{title}
```

groq```
// return values for multiple attributes
*[_type == 'movie']{_id, _type, title}
```

groq```
// explicitly name the return field for _id
*[_type == 'movie']{'renamedId': _id, _type, title}
```

groq```
// Return an array of attribute values (no object wrapper)
*[_type == 'movie'].title
*[_type == 'movie']{'characterNames': castMembers[].characterName}
```

groq```
// movie titled Arrival and its posterUrl
*[_type=='movie' && title == 'Arrival']{title,'posterUrl': poster.asset->url}
```

groq```
// Explicitly return all attributes
*[_type == 'movie']{...}
```

groq```
// Some computed attributes, then also add all attributes of the result
*[_type == 'movie']{'posterUrl': poster.asset->url, ...}
```

groq```
// Default values when missing or null in document
*[_type == 'movie']{..., 'rating': coalesce(rating, 'unknown')}
```

groq```
// Number of elements in array 'actors' on each movie
*[_type == 'movie']{"actorCount": count(actors)}
```

groq```
// Apply a projection to every member of an array
*[_type == 'movie']{castMembers[]{characterName, person}}
```

groq```
// Filter embedded objects
*[_type == 'movie']{castMembers[characterName match 'Ripley']{characterName, person}}
```

groq```
// Follow every reference in an array of references
*[_type == 'book']{authors[]->{name, bio}}
```

groq```
// Explicity name the outer return field
{'threeMovieTitles': *[_type=='movie'][0..2].title}
```

groq```
// Combining several unrelated queries in one request
{'featuredMovie': *[_type == 'movie' && title == 'Alien'][0], 'scifiMovies': *[_type == 'movie' && 'sci-fi' in genres]}
```

groq```
// *
*   // Everything, i.e. all documents

// @
*[ @["1"] ] // @ refers to the root value (document) of the scope
*[ @[$prop]._ref == $refId ] // Select reference prop from an outside variable.
*{"arraySizes": arrays[]{"size": count(@)}} // @ also works for nested scopes

// ^
// ^ refers to the enclosing document. Here ^._id refers to the id
// of the enclosing person record.
*[_type=="person"]{
  name,
  "relatedMovies": *[_type=='movie' && references(^._id)]{ title }
}
```

groq```
*[_type=='movie']{..., "popularity": select(
popularity > 20 => "high",
popularity > 10 => "medium",
"low"
)}
```

groq```
*[_type=='movie']{
...,
releaseDate >= '2018-06-01' => {
"screenings": *[_type == 'screening' && movie._ref == ^._id],
"news": *[_type == 'news' && movie._ref == ^._id],
},
popularity > 20 && rating > 7.0 => {
"featured": true,
"awards": *[_type == 'award' && movie._ref == ^._id],
},
}
```

groq```
*[_type=='movie']{
...,
...select(releaseDate >= '2018-06-01' => {
"screenings": *[_type == 'screening' && movie._ref == ^._id],
"news": *[_type == 'news' && movie._ref == ^._id],
}),
...select(popularity > 20 && rating > 7.0 => {
"featured": true,
"awards": *[_type == 'award' && movie._ref == ^._id],
}),
}
```

groq```
*[_type=="movie" && references(*[_type=="person" && age > 99]._id)]{title}
```

groq```
*{"title": coalesce(title.fi, title.en)}
```

groq```
count(*[_type == 'movie' && rating == 'R']) // returns number of R-rated movies
*[_type == 'movie']{
title,
"actorCount": count(actors) // Counts the number of elements in the array actors
}
```

groq```
round(3.14, 1) // 3.1
// score() adds points to the score value depending
// on the use of the string "GROQ" in each post's description
// The value is then used to order the posts
*[_type == "post"]
```

groq```
{ _score, title }
```

groq```
*[_type == "movie" && movieRating > 3] |
score(
title match $term,
boost(movieRating > 8, 3)
)
```

groq```
*[_type == "post"]
```

groq```
{ "plaintextBody": pt::text(body) }
```

groq```
*[sanity::versionOf('document-id')]
```

groq```
*[sanity::partOfRelease('release-id')]
```

groq```
*[] {
  'employees': employees[] {
    _type == 'reference' => @->,
    _type != 'reference' => @
  }
}
```

groq```
// Checks if a document: 
// is of _type "author"
// AND has a name value of "John Doe"
// If both are true, returns all documents matching
*[_type == "author" && name == "John Doe"]
```

groq```
// Checks if a document:
// is of _type "movie"
// AND has a title of "Arrival"
// If both are true, returns all documents matching
*[_type == "movie" && title == "Arrival"]
```

groq```
// Checks if a document:
// is of _type "movie"
// AND includes the string 'sci-fi' in its genres field
// If both are true, returns all documents matching
*[_type == "movie" && "sci-fi" in genres]
```

groq```
// Checks if a document:
// has a number property `popularity` greater than 15
// OR has a releaseDate after 2016-04-25
// Returns all documents that match EITHER condition
*[popularity > 15 || releaseDate > "2016-04-25"]
```

groq```
// Checks if a document:
// has a postCount greater than 20
// OR has a boolean property `featured` equal to true
// Returns all documents that match EITHER condition
*[postCount > 20 || featured]
```

groq```
// Checks if a document:
// has a name value of "John Doe"
// OR has a slug.current property containing the word "forever"
// Returns all documents that match EITHER condition
*[name == "John Doe" || slug.current match "forever"]
```

groq```
// Returns all docs that don't start with a.b.
*[!(_id in path("a.b.**"))]
```

groq```
// Returns all documents where the boolean `awardWinner` is false
*[!awardWinner]
```

groq```
// Returns true if document's _type
// is included in the array (either "movie" or "person")
*[_type in ["movie", "person"]]
```

groq```
// Returns true if "myTag" is in tags array
*["myTag" in tags]
```

groq```
// Returns true if document's _type
// is *not* included in the array (neither "movie" nor "person")
*[!(_type in ["movie", "person"])]
```

groq```
// Returns true if "myTag" is in tags array
*[!("myTag" in tags)]
```

groq```
// Returns all items in the root array
*[]
```

groq```
// Returns all items from the root array
// matching the filter provided (documents with _type of "movie")
*[_type == "movie"]
```

groq```
// @ refers to the root value (document) of the scope
*[ @["1"] ]
```

groq```
// @ refers to the myArray array
// Returns the total number of items in my Array
*{"arraySizes": myArray[]{"size": count(@)}}
```

groq```
// Value of ^ is the current doc in the "someParent" array
*[_type == "someParent"]{ 
  "referencedBy": *[ references(^._id) ]
}
```

groq```
// person.someObj.parentName returns root name value
*[_type=="person"]{
  name,
  someObj{
    name,
    "parentName": ^.name
  }
}
```

groq```
*[_type == "content"]{
  "children": *[references(^._id)]{
    "grandchildren": *[references(^._id) && references(^.^._id)]
  }
}
```

groq```
// Returns the name string from someObject
*[_type == "document"] {
  "nestedName": someObject.name
}
```

groq```
// Returns the illegalIdentifier value from someObject
*[_type == "document"] {
  "nestedName": someObject["illegalIdentifier"]
}
```

groq```
description
```

groq```
*[_type=='movie']{title,'cast': castMembers[].person->name}
```

groq```
// title contains a word starting with "wo"
*[title match "wo*"]
```

groq```
// title and body combined contains a word starting with "wo" and the full word "zero"
*[[title, body] match ["wo*", "zero"]]
```

groq```
// title must contain both the full words "hello" and "goodbye"
*[title match ["hello", "goodbye"]]
```

groq```
* | order(_id asc)
```

groq```
*[_type == "post"] | order(date desc)
```

groq```
*[]{ _id, title } | order(_createdAt asc)
```

groq```
awards->name
```

groq```
*[_type == "movie"] {
  ...,
  "actors": actors[]->{
    ...
    firstname,
    lastname,
  }
}
```

groq```
// For books by any award winning author
// return title of book
// follow the author reference to get their name
// follow the award reference via the author to get the award title
// finally list names of other authors who have received the same award

*[_type == "book" && defined(author->award)] {
  title,
 "By: ": author->name,
 "Winner of: ": author->award->title,
 "Also won by: ": 
		*[_type == "author" && references(^.author->award._ref) ].name
}
```

groq```
*[_type == "sanity.imageAsset"]
```

