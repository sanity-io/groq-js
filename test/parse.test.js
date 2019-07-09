const {parse} = require('../src');

describe("Basic parsing", () => {
  test("Example query", () => {
    let query = `*[_type == "product"]{name}`
    let tree = parse(query);
    expect(tree).toMatchSnapshot();
  })
})