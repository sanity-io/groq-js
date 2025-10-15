import t from 'tap'
import {parse} from '../src/parser'
import {unparse} from '../src/unparse'

t.test('unparse', async () => {
  const queries = [
    "*[_type == 'bar']",
    'a * b + 5',
    '[1, 2, ...abc, 5]',
    '*[_type == "foo"]|order(bar asc)',
    '*[_type == "bar"]{foo->, "baz": bar->baz}',
    '*[_type == "bar" || foo in 5..10]',
    '*[_type == "bar"]{"foo":*{"bar": ^.baz}}',
    '*[_type == "bar" && _id in path("foo")]',
    '*._id',
    'select(1 => 2, foo)',
    'select(1 => 2)',
  ]

  for (const query of queries) {
    t.test(query, async () => {
      const tree = parse(query)
      const text = unparse(tree)
      const tree2 = parse(text)
      t.same(tree, tree2)
    })
  }
})

t.test('unparse functions', async () => {
  const functionQueries = [
    // Global functions
    'coalesce(foo, bar, "default")',
    'count(*[_type == "post"])',
    'dateTime("2024-01-01T00:00:00Z")',
    'defined(foo)',
    'identity()',
    'length("hello")',
    'length([1, 2, 3])',
    'path("foo.bar")',
    'string(123)',
    'references("abc")',
    'references(["abc", "def"])',
    'round(3.14)',
    'round(3.14159, 2)',
    'now()',
    'lower("HELLO")',
    'upper("hello")',

    // String functions
    'string::lower("HELLO")',
    'string::upper("hello")',
    'string::split("a,b,c", ",")',
    'string::startsWith("hello", "hel")',

    // Array functions
    'array::join(["a", "b", "c"], ", ")',
    'array::compact([1, null, 2, null, 3])',
    'array::unique([1, 2, 2, 3, 1])',
    'array::intersects([1, 2, 3], [2, 3, 4])',

    // Math functions
    'math::min([1, 2, 3])',
    'math::max([1, 2, 3])',
    'math::sum([1, 2, 3])',
    'math::avg([1, 2, 3])',

    // DateTime functions
    'dateTime::now()',

    // PT functions
    'pt::text(body)',

    // Sanity functions
    'sanity::projectId()',
    'sanity::dataset()',
    'sanity::versionOf("abc")',
    'sanity::partOfRelease("release-1")',

    // Releases functions
    'releases::all()',

    // Diff functions (3 args)
    'diff::changedAny({}, {}, foo)',
    'diff::changedOnly({"foo": 1}, {"foo": 2}, foo)',

    // Complex function usage
    '*[_type == "post" && defined(publishedAt)]',
    '*[_type == "post"] | order(publishedAt desc) [0...10]',
    '*[_type == "author"]{name, "postCount": count(*[_type == "post" && references(^._id)])}',
    'select(count(*[_type == "post"]) > 10 => "many", "few")',
    '*[string::startsWith(slug.current, "blog-")]',
    '*[_type == "post"]{..., "excerpt": string::split(body, " ")[0...10]}',
    '*[_type == "product"] | order(price asc) {name, price, "formatted": string(round(price, 2))}',
    '{...@, "now": dateTime::now(), "timestamp": now()}',
    '*[_type == "post" && dateTime(publishedAt) < dateTime::now()]',
    'array::unique(*[_type == "post"].categories)',

    // Pipe functions
    '*[_type == "post"] | order(publishedAt desc)',
    '*[_type == "post"] | order(publishedAt asc, title desc)',
    '*[_type == "post"] | score(title match "foo")',
    '*[_type == "post"] | score(title match "foo", body match "bar")',
    '*[_type == "post"] | order(publishedAt desc) | score(title match "featured")',

    // Operators
    '1 + 2',
    '1 - 2',
    '1 * 2',
    '1 / 2',
    '1 % 2',
    '2 ** 3',
    '1 == 2',
    '1 != 2',
    '1 < 2',
    '1 <= 2',
    '1 > 2',
    '1 >= 2',
    '"abc" in ["abc", "def"]',
    '"hello" match "hel*"',
    'true && false',
    'true || false',
    '!true',
    '-5',
    '+5',

    // Nested functions
    'upper(lower("HELLO"))',
    'string(round(length("hello") * 2.5, 1))',
    'count(array::compact([1, null, 2]))',
    'math::max(array::unique([1, 2, 2, 3]))',

    // Functions with complex arguments
    'coalesce(null, null, "fallback")',
    'defined(foo.bar.baz)',
    'references(*[_type == "author"][0]._id)',
    'round(math::avg([1, 2, 3, 4, 5]), 2)',

    // Edge cases
    'string::split("", ",")',
    'string::split("hello", "")',
    'array::join([], ", ")',
    'count([])',
    'length("")',
    'math::sum([])',
  ]

  for (const query of functionQueries) {
    t.test(query, async () => {
      const tree = parse(query)
      const text = unparse(tree)
      const tree2 = parse(text)
      t.same(tree, tree2)
    })
  }
})
