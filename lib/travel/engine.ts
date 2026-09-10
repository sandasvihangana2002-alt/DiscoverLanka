export type DestinationNode = { id:string; slug:string; name:string; region:string; summary:string; best_time:string; latitude:number; longitude:number };
export type ExperienceNode = { slug:string; name:string; category:string|null; summary:string|null; destination_slug:string|null; destination_name:string|null };
export type ItineraryItem = { time:string; title:string; kind:"arrival"|"explore"|"experience"|"food"|"rest"|"transfer"; note?:string };
export type ItineraryDay = { day:number; destination:DestinationNode; transfer?:{from:string;km:number;minutes:number}; focus:string; items:ItineraryItem[] };

const kmBetween=(a:DestinationNode,b:DestinationNode)=>{
 const r=6371; const toRad=(n:number)=>n*Math.PI/180; const dLat=toRad(b.latitude-a.latitude); const dLon=toRad(b.longitude-a.longitude);
 const x=Math.sin(dLat/2)**2+Math.cos(toRad(a.latitude))*Math.cos(toRad(b.latitude))*Math.sin(dLon/2)**2;
 return r*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
};
const travelMinutes=(km:number)=>Math.max(45,Math.round((km/32)*60+20));

export function buildRealisticItinerary(route:DestinationNode[], experiences:ExperienceNode[], days:number, pace:string, interests:string[]):ItineraryDay[]{
 const out:ItineraryDay[]=[]; if(!route.length) return out;
 const slots=Math.max(route.length, Math.min(days, route.length*3));
 const counts=route.map((_,i)=>i<route.length-1?Math.floor(slots/route.length)+(i<slots%route.length?1:0):Math.floor(slots/route.length));
 let day=1;
 route.forEach((dest,idx)=>{
   const count=Math.max(1,counts[idx]||1);
   for(let local=0;local<count && day<=days;local++,day++){
     const first=idx===0&&local===0;
     const transfer=idx>0&&local===0?(()=>{const km=kmBetween(route[idx-1],dest);return{from:route[idx-1].name,km:Math.round(km),minutes:travelMinutes(km)}})():undefined;
     const matching=experiences.filter(e=>e.destination_slug===dest.slug);
     const picked=matching[(local+idx)%Math.max(1,matching.length)];
     const focus=local===0?(interests[0]||"Signature sights"):(interests[(local+idx)%Math.max(1,interests.length)]||"Local discovery");
     const items:ItineraryItem[]=[];
     if(transfer) items.push({time:"08:00",title:`Travel from ${transfer.from}`,kind:"transfer",note:`Approx. ${transfer.minutes} min road journey · ${transfer.km} km direct`});
     else items.push({time:first?"09:00":"08:30",title:pace==="Slow"?"Slow morning & local breakfast":"Morning orientation",kind:"food"});
     if(picked) items.push({time:"11:00",title:picked.name,kind:"experience",note:picked.summary||"A curated DiscoverLanka moment."});
     else items.push({time:"11:00",title:`Explore ${dest.name}`,kind:"explore",note:dest.summary});
     items.push({time:"14:30",title:focus==="Food"?"Local food stop":`Explore ${dest.name} at an easy pace`,kind:focus==="Food"?"food":"explore"});
     items.push({time:pace==="Fast"?"18:00":"17:30",title:"Golden hour & open evening",kind:"rest",note:"Keep the evening flexible for a spontaneous local find."});
     out.push({day,destination:dest,transfer,focus,items});
   }
 });
 while(out.length<days){const dest=route[(out.length)%route.length]; out.push({day:out.length+1,destination:dest,focus:"Free exploration",items:[{time:"09:00",title:`Free morning in ${dest.name}`,kind:"rest"},{time:"13:00",title:"Choose a local favourite",kind:"food"},{time:"17:30",title:"Golden hour at your own pace",kind:"rest"}]});}
 return out.slice(0,days);
}
