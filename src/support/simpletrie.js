class TrieNode {
    constructor(k){
	this.key = k
	this.children = {}
    }
    //assumes direct discendant 
    addChild(node){
	this.children[node.key] = node
    }

}

export class SimpleTrie {
    constructor(){
	this.root = new TrieNode('')
	this.nodeCount = 0

	this.addString = this.addString.bind(this)
	this.exists = this.exists.bind(this)
	this.query = this.query.bind(this)
    }

    addString(string) {
	let arrChars = string.split('')
	this.insert(arrChars)
    }

    //Insert into the trie a string based on its character array
    insert(arrChars) {
	let start = this.root
	arrChars.reduce( (loc,symb) => {
	    if(!loc.children[symb]){
		loc.children[symb] =new TrieNode(symb)
		this.nodeCount += 1		
	    }
	    return loc.children[symb]
	},start)
    }

    //Test for the existance of a string
    //Assumes empty string is always present
    exists(string) {
	let rez = this.descend(string)
	if(rez)
	    return true
	else
	    return false
    }

    descend (prefix) {
	let curNode = this.root
	let ix = 0
	let len = prefix.length
	let node = null
	while (curNode && ix < len){
	    if(curNode.children[prefix[ix]]){
		curNode = curNode.children[prefix[ix]]
		ix++
	    }
	    else
		return null
	}
	return curNode
    }

    accumulateStrings(prefix,node,currDepth,maxDepth,flags){
	let results = []
	if(currDepth === (maxDepth))
	{
	    return [prefix]
	}
	else
	{
	    results = Object.keys(node.children).reduce((list,key)=>{
		return list.concat(this.accumulateStrings(prefix+key,
						     node.children[key],
						     currDepth+1,
						     maxDepth,
						     flags))
	    },[])
	}
	if(flags && flags.exact)
	    return results
	results.push(prefix)
	return results
    }
    
    gatherResults(prefix,node,depth,flags){
	return this.accumulateStrings(prefix,node,0,depth,flags)
    }
    
    query(prefix,depth,exact) {
	let node = this.descend(prefix)
	let flags = null
	if(depth === 0)
	    return [node.key]
	if(exact)
	    flags={exact:true}
	let results = this.gatherResults(prefix,node,depth,flags)

	
	return results
    }
    
    gQuery(prefix,depth,exact){
	if(!exact)
	    exact = (x) => true
	if(Array.isArray(prefix))
	{
	    return prefix.reduce( (acc,pfx) => {
		return acc.concat(this.query(pfx,depth,exact(pfx)))
	    },[])
	}
	else
	{
	    return this.query(prefix,depth,exact(prefix))
	}
    }
    
}

