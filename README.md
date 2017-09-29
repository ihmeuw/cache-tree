# cachetree.js

CacheTree is a class for storing client-side data objects 
in a nested object structure. Data can be easily retrieved 
by passing an object as a filter into one of its methods.
CacheTree can also give an approximation of data missing
using a diff method to reduce the amount of data needed
to be fetched. CacheTree also implements a Least Recently
Used cache replacement algorithm to limit the amount of 
memory used by the cache.

## Use

Create a new cacheTree with the `new` operator. The constructor takes
two arguments: `hierarchy[array]`, `maxSize[number][optional]`.
The first argument is an array of strings. The order of the array
determines the hierarchy of the tree, the first element being the 
top level, and the last element being at the bottom. A second optional
argument is a number (positive integer) that gives the maximum number of
objects to be stored in the cache before evicting data.

```javascript
const cache = new CacheTree(['level_1', 'level_2', ..., 'level_n']);
```

## Tests

There are tests for each method in the API. Please see the tests for 
descriptions and expected behavior.

## LRU algorithm

CacheTree implements a Least Recently Used cache replacement algorithm.
As data is added to the cache, a linked list keeps the order of new data
and recently accessed data. New and recently used data is placed in the 
front of the list, while unused cached data works its way towards the 
end of the list. When the cache reaches it's `maxSize`, old data is 
removed from the list and cache.

## API

Method | Arguments | Return | Description
--- | :---: | :---: | ---
`get` | filter[object] | array | Returns an array of data stored in the cache that satisfies the filter. Each data object is a new object.
`set` | data[object | array] | none | Inserts a data object or an array of data objects into the cache. The data is nested into the cache object by its keys and hierarchy provided in the constructor.
`clone` | none | object | Creates a new CacheTree object with the same cache object and linked list.
`has` | filter[object] | boolean | Returns `false` if cache is missing any part of the cartesian product of the parameters provided in the filter. Returns `true` otherwise.
`getDiff` | paramFilter[object] | object | Returns an object similar to `paramFilter`. The returned object describes the smallest cartesian product of parameters needed to fill in missing data for `paramFilter`.
`clearCache` | none | none | Replaces the cache with an empty object and creates a new linked list.
`getSize` | none | number | Returns the number of data objects stored in the cache.