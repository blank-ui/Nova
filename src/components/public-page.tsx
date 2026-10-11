import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

export function PublicPage({eyebrow,title,subtitle,children}:{eyebrow:string;title:React.ReactNode;subtitle:string;children?:React.ReactNode}){
 return <><Navigation/><main><section className="grid-paper" style={{padding:"86px 0 68px",position:"relative",overflow:"hidden"}}><div className="orb" style={{width:440,height:440,right:"-5%",top:-130,background:"radial-gradient(circle,#e2e4ff,transparent 68%)"}}/><div className="shell" style={{position:"relative"}}><div className="eyebrow">{eyebrow}</div><h1 style={{fontSize:"clamp(48px,7vw,82px)",lineHeight:1.02,letterSpacing:"-.08em",fontWeight:600,maxWidth:900,margin:"20px 0"}}>{title}</h1><p style={{fontSize:17,lineHeight:1.8,color:"var(--muted)",maxWidth:620,margin:0}}>{subtitle}</p></div></section><section className="shell" style={{padding:"54px 0 30px"}}>{children}</section></main><Footer/></>
}

export function FeatureGrid({items}:{items:{title:string;text:string}[]}){return <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(235px,1fr))",gap:14}}>{items.map((item,i)=><article className="card" key={item.title} style={{padding:25,minHeight:186}}><div className="eyebrow">0{i+1} / Focus</div><h2 style={{fontSize:20,letterSpacing:"-.05em",margin:"28px 0 9px"}}>{item.title}</h2><p style={{fontSize:13,color:"var(--muted)",lineHeight:1.8,margin:0}}>{item.text}</p></article>)}</div>}

export function CTA(){return <div style={{marginTop:55,padding:32,borderRadius:22,background:"#e9ebf6",display:"flex",alignItems:"center",justifyContent:"space-between",gap:20,flexWrap:"wrap"}}><div><div className="eyebrow">Have something in mind?</div><h2 style={{fontSize:30,letterSpacing:"-.06em",margin:"9px 0 0"}}>Let&apos;s shape it together.</h2></div><Link className="button" href="/contact">Start a conversation <ArrowUpRight size={15}/></Link></div>}

export function Checklist({items}:{items:string[]}){return <ul style={{listStyle:"none",padding:0,display:"grid",gap:13}}>{items.map(item=><li key={item} style={{display:"flex",gap:10,alignItems:"center",fontSize:14,color:"#555d6c"}}><Check size={15} color="#5263ff"/>{item}</li>)}</ul>}
