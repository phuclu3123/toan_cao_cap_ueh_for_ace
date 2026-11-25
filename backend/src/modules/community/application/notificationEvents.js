import { randomUUID } from 'node:crypto';
export function appendCommunityNotification(post,{kind,actor,recipients,targetId,anchor,content=''}) {
  content=String(content).replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/gi,' ');
  const add=(type,targets)=>{
    const ids=[...new Set(targets.filter(id=>id && id!==actor.id))];if(!ids.length) return;
    post.notificationEvents ||= [];
    post.notificationEvents.push({id:randomUUID(),kind:type,at:new Date(),actor:{id:actor.id,name:actor.name,avatar:actor.avatar || ''},recipients:ids,targetId,anchor});
  };
  add(kind,recipients);
  // Mention existing participants by @display-name or @{stable-account-id}.
  // Ambiguous names are intentionally ignored, and mentions never send email.
  const actors=[post.author,...(post.answers || []).flatMap(a=>[a.author,...(a.comments || []).map(c=>c.author)])].filter(Boolean);
  const named=new Map();for(const a of actors) { const key=String(a.name || '').toLocaleLowerCase('vi');if(!named.has(key)) named.set(key,new Set());named.get(key).add(a.id); }
  const mentioned=actors.filter(a=>{
    if(content.includes(`@{${a.id}}`)) return true;
    const name=String(a.name || '').toLocaleLowerCase('vi');
    if(!name || named.get(name)?.size!==1) return false;
    const escaped=name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    return new RegExp(`(^|\\s)@${escaped}(?=$|[\\s,.!?;:])`,'iu').test(content.toLocaleLowerCase('vi'));
  }).map(a=>a.id).filter(id=>!recipients.includes(id));
  add('mention',mentioned);
}
