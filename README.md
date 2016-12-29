# CacheTree.js

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
as the first argument an array of strings. The order of the array
determines the hierarchy of the tree, the first element being the 
top level, and the last element being at the bottom. A second optional
argument is a number (positive integer) that gives the maximum number of
objects to be stored in the cache before evicting data.

```javascript
const cache = new CacheTree(['level_1', 'level_2', ..., 'level_n']);
```

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
`get` | filter | object | desc
`set` | data | none | desc
`cloneCache` | none | object | desc
`has` | filter | boolean | desc
`getDiff` | paramFilter | object | desc
`clearCache` | none | none | desc
`getSize` | none | number | desc