// プログラム穴埋め演習（dncl-quiz）の問題データの検証：
//   node _tools/check-dncl-quiz.js
// 正解の出力を表示し、正解以外の組み合わせが判定を通らないことを確かめる
const html=process.argv[2]||require('path').join(__dirname,'..','dncl-quiz','index.html');
const src=require('fs').readFileSync(html,'utf8');
const e0=src.indexOf('(function(root){'), e1=src.indexOf(';',src.indexOf('})(typeof window',e0))+1;
new Function(src.slice(e0,e1))();
const QUESTIONS=new Function(src.slice(src.indexOf('const QUESTIONS='),src.indexOf('/* QUESTIONS END */'))+';return QUESTIONS;')();
const E=globalThis.PEngine;
const BLANK_RE=/【\s*([ァ-ヶー]{1,3})\s*】/g;
function run(code,vals,inputs){
  const src=code.replace(BLANK_RE,(m,n)=>vals[n]!==undefined?vals[n]:m);
  try{ const r=new E.Runner(E.parse(src),{maxSteps:100000,inputs:inputs.slice()}); while(r.step()!==null){} return r.out.join('\n'); }
  catch(e){ return 'ERR:'+e.message; }
}
let bad=0;
for(const q of QUESTIONS){
  const names=[...new Set([...q.code.matchAll(BLANK_RE)].map(m=>m[1]))];
  const want=q.tests.map(t=>run(q.code,q.answer,t));
  console.log(`\n${q.id} 正解 →`, JSON.stringify(want));
  if(want.some(w=>w.startsWith('ERR'))){ bad++; console.log('  !! 正解でエラー'); }
  // すべての組み合わせ
  const combos=names.reduce((acc,n)=>acc.flatMap(c=>(Array.isArray(q.choices)?q.choices:q.choices[n]).map(ch=>({...c,[n]:ch}))),[{}]);
  for(const c of combos){
    const isAns=names.every(n=>c[n]===q.answer[n]);
    const got=q.tests.map(t=>run(q.code,c,t));
    const pass=got.every((g,i)=>g===want[i]);
    if(pass && !isAns){ bad++; console.log('  !! 別解で通る:',JSON.stringify(c),JSON.stringify(got)); }
    if(names.length===1 || names.filter(n=>c[n]!==q.answer[n]).length===1)
      if(!isAns) console.log('  ×',JSON.stringify(c),'→',JSON.stringify(got).slice(0,90));
  }
}
console.log(bad? `\n問題あり: ${bad}` : '\nOK：正解の組み合わせだけが判定を通ります');
process.exit(bad?1:0);
