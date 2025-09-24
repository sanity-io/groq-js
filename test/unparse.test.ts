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
      console.log(text)
      const tree2 = parse(text)
      t.same(tree, tree2)
    })
  }
})
