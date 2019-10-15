const {parse} = require('../src');

describe("Basic parsing", () => {
  test("Example query", () => {
    let query = `*[_type == "product"]{name}`
    let tree = parse(query);
    expect(tree).toMatchSnapshot();
  })
})

describe("Error reporting", () => {
  test("Query with syntax error", () => {
    let query = `*[_type == "]`
    try {
      parse(query);
    } catch(error) {
      expect(error.name).toBe("GroqSyntaxError")
      expect(error.position).toBe(13)
      expect(error.message).toBe("Syntax error in GROQ query at position 13")
    }
  });
})