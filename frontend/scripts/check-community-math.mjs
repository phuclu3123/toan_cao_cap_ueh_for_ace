import katex from 'katex';
import {communityExcerpt} from '../src/utils/communityExcerpt.js';
const result=await fetch('http://localhost:5000/api/community/posts?limit=30').then(r=>r.json());
for(const post of result.posts||[]) for(const match of communityExcerpt(post.content).matchAll(/\$([^$]+)\$/g)) {try {katex.renderToString(match[1],{strict:'error',throwOnError:true,trust:false});}catch(error){console.log(post.id, error.message.slice(0,300));}}
