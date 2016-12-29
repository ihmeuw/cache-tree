# CacheTree.js

CacheTree is a class for storing client-side data objects 
in a nested object structure. Data can be easily retrieved 
by passing an object as a filter into one of its methods.
CacheTree can also give an approximation of data missing
using a diff method to reduce the amount of data needed
to be fetched. CacheTree also implements a Least Recently
Used cache replacement algorithm to limit the amount of 
memory used by the cache.

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