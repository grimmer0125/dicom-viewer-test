var b=Object.defineProperty;var k=(a,t,e)=>t in a?b(a,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):a[t]=e;var h=(a,t,e)=>k(a,typeof t!="symbol"?t+"":t,e);var y=Object.defineProperty,D=(a,t)=>{for(var e in t)y(a,e,{get:t[e],enumerable:!0})},L={hSamp:0,quantTableSel:0,vSamp:0},v=class{constructor(a,t,e){h(this,"buffer");h(this,"index");this.buffer=new Uint8Array(a,t,e),this.index=0}get16(){const a=(this.buffer[this.index]<<8)+this.buffer[this.index+1];return this.index+=2,a}get8(){const a=this.buffer[this.index];return this.index+=1,a}},S=class{constructor(){h(this,"dimX",0);h(this,"dimY",0);h(this,"numComp",0);h(this,"precision",0);h(this,"components",[])}read(a){let t=0,e;const r=a.get16();t+=2,this.precision=a.get8(),t+=1,this.dimY=a.get16(),t+=2,this.dimX=a.get16(),t+=2,this.numComp=a.get8(),t+=1;for(let o=1;o<=this.numComp;o+=1){if(t>r)throw new Error("ERROR: frame format error");const s=a.get8();if(t+=1,t>=r)throw new Error("ERROR: frame format error [c>=Lf]");e=a.get8(),t+=1,this.components[s]||(this.components[s]={...L}),this.components[s].hSamp=e>>4,this.components[s].vSamp=e&15,this.components[s].quantTableSel=a.get8(),t+=1}if(t!==r)throw new Error("ERROR: frame format error [Lf!=count]");return 1}},x={};D(x,{crc32:()=>I,crcTable:()=>T,createArray:()=>w,makeCRCTable:()=>E});var w=(...a)=>{if(a.length>1){const t=a[0],e=a.slice(1),r=[];for(let o=0;o<t;o++)r[o]=w(...e);return r}else return Array(a[0]).fill(void 0)},E=function(){let a;const t=[];for(let e=0;e<256;e++){a=e;for(let r=0;r<8;r++)a=a&1?3988292384^a>>>1:a>>>1;t[e]=a}return t},T=E(),I=function(a){const t=new Uint8Array(a);let e=-1;for(let r=0;r<t.length;r++)e=e>>>8^T[(e^t[r])&255];return(e^-1)>>>0},p,C=(p=class{constructor(){h(this,"l");h(this,"th");h(this,"v");h(this,"tc");this.l=w(4,2,16),this.th=[0,0,0,0],this.v=w(4,2,16,200),this.tc=[[0,0],[0,0],[0,0],[0,0]]}read(t,e){let r=0,o,s,n,i,u;const f=t.get16();for(r+=2;r<f;){if(o=t.get8(),r+=1,s=o&15,s>3)throw new Error("ERROR: Huffman table ID > 3");if(n=o>>4,n>2)throw new Error("ERROR: Huffman table [Table class > 2 ]");for(this.th[s]=1,this.tc[s][n]=1,i=0;i<16;i+=1)this.l[s][n][i]=t.get8(),r+=1;for(i=0;i<16;i+=1)for(u=0;u<this.l[s][n][i];u+=1){if(r>f)throw new Error("ERROR: Huffman table format error [count>Lh]");this.v[s][n][i][u]=t.get8(),r+=1}}if(r!==f)throw new Error("ERROR: Huffman table format error [count!=Lf]");for(i=0;i<4;i+=1)for(u=0;u<2;u+=1)this.tc[i][u]!==0&&this.buildHuffTable(e[i][u],this.l[i][u],this.v[i][u]);return 1}buildHuffTable(t,e,r){let o,s,n,i,u;for(s=0,n=0;n<8;n+=1)for(i=0;i<e[n];i+=1)for(u=0;u<256>>n+1;u+=1)t[s]=r[n][i]|n+1<<8,s+=1;for(n=1;s<256;n+=1,s+=1)t[s]=n|p.MSB;for(o=1,s=0,n=8;n<16;n+=1)for(i=0;i<e[n];i+=1){for(u=0;u<256>>n-7;u+=1)t[o*256+s]=r[n][i]|n+1<<8,s+=1;if(s>=256){if(s>256)throw new Error("ERROR: Huffman table error(1)!");s=0,o+=1}}}},h(p,"MSB",2147483648),p),d,B=(d=class{constructor(){h(this,"precision",[]);h(this,"tq",[0,0,0,0]);h(this,"quantTables",w(4,64))}read(t,e){let r=0,o,s,n;const i=t.get16();for(r+=2;r<i;){if(o=t.get8(),r+=1,s=o&15,s>3)throw new Error("ERROR: Quantization table ID > 3");if(this.precision[s]=o>>4,this.precision[s]===0)this.precision[s]=8;else if(this.precision[s]===1)this.precision[s]=16;else throw new Error("ERROR: Quantization table precision error");if(this.tq[s]=1,this.precision[s]===8){for(n=0;n<64;n+=1){if(r>i)throw new Error("ERROR: Quantization table format error");this.quantTables[s][n]=t.get8(),r+=1}d.enhanceQuantizationTable(this.quantTables[s],e)}else{for(n=0;n<64;n+=1){if(r>i)throw new Error("ERROR: Quantization table format error");this.quantTables[s][n]=t.get16(),r+=2}d.enhanceQuantizationTable(this.quantTables[s],e)}}if(r!==i)throw new Error("ERROR: Quantization table error [count!=Lq]");return 1}},h(d,"enhanceQuantizationTable",function(t,e){for(let r=0;r<8;r+=1)t[e[0*8+r]]*=90,t[e[4*8+r]]*=90,t[e[2*8+r]]*=118,t[e[6*8+r]]*=49,t[e[5*8+r]]*=71,t[e[1*8+r]]*=126,t[e[7*8+r]]*=25,t[e[3*8+r]]*=106;for(let r=0;r<8;r+=1)t[e[0+8*r]]*=90,t[e[4+8*r]]*=90,t[e[2+8*r]]*=118,t[e[6+8*r]]*=49,t[e[5+8*r]]*=71,t[e[1+8*r]]*=126,t[e[7+8*r]]*=25,t[e[3+8*r]]*=106;for(let r=0;r<64;r+=1)t[r]>>=6}),d),A={acTabSel:0,dcTabSel:0,scanCompSel:0},P=class{constructor(){h(this,"ah",0);h(this,"al",0);h(this,"numComp",0);h(this,"selection",0);h(this,"spectralEnd",0);h(this,"components",[])}read(a){let t=0,e,r;const o=a.get16();for(t+=2,this.numComp=a.get8(),t+=1,e=0;e<this.numComp;e+=1){if(this.components[e]={...A},t>o)throw new Error("ERROR: scan header format error");this.components[e].scanCompSel=a.get8(),t+=1,r=a.get8(),t+=1,this.components[e].dcTabSel=r>>4,this.components[e].acTabSel=r&15}if(this.selection=a.get8(),t+=1,this.spectralEnd=a.get8(),t+=1,r=a.get8(),this.ah=r>>4,this.al=r&15,t+=1,t!==o)throw new Error("ERROR: scan header format error [count!=Ns]");return 1}},R=function(){const a=new ArrayBuffer(2);return new DataView(a).setInt16(0,256,!0),new Int16Array(a)[0]===256}(),l,_=(l=class{constructor(t,e){h(this,"buffer",null);h(this,"stream",null);h(this,"frame",new S);h(this,"huffTable",new C);h(this,"quantTable",new B);h(this,"scan",new P);h(this,"DU",w(10,4,64));h(this,"HuffTab",w(4,2,50*256));h(this,"IDCT_Source",[]);h(this,"nBlock",[]);h(this,"acTab",w(10,1));h(this,"dcTab",w(10,1));h(this,"qTab",w(10,1));h(this,"marker",0);h(this,"markerIndex",0);h(this,"numComp",0);h(this,"restartInterval",0);h(this,"selection",0);h(this,"xDim",0);h(this,"yDim",0);h(this,"xLoc",0);h(this,"yLoc",0);h(this,"outputData",null);h(this,"restarting",!1);h(this,"mask",0);h(this,"numBytes",0);h(this,"precision");h(this,"components",[]);h(this,"getter",null);h(this,"setter",null);h(this,"output",null);h(this,"selector",null);this.buffer=t??null,this.numBytes=e??0}decompress(t,e,r){return this.decode(t,e,r).buffer}decode(t,e,r,o){let s=0;const n=[];let i,u;const f=[],g=[];let m;t&&(this.buffer=t),o!==void 0&&(this.numBytes=o),this.stream=new v(this.buffer,e,r),this.buffer=null,this.xLoc=0,this.yLoc=0;let c=this.stream.get16();if(c!==65496)throw new Error("Not a JPEG file");for(c=this.stream.get16();c>>4!==4092||c===65476;){switch(c){case 65476:this.huffTable.read(this.stream,this.HuffTab);break;case 65484:throw new Error("Program doesn't support arithmetic coding. (format throw new IOException)");case 65499:this.quantTable.read(this.stream,l.TABLE);break;case 65501:this.restartInterval=this.readNumber()??0;break;case 65504:case 65505:case 65506:case 65507:case 65508:case 65509:case 65510:case 65511:case 65512:case 65513:case 65514:case 65515:case 65516:case 65517:case 65518:case 65519:this.readApp();break;case 65534:this.readComment();break;default:if(c>>8!==255)throw new Error("ERROR: format throw new IOException! (decode)")}c=this.stream.get16()}if(c<65472||c>65479)throw new Error("ERROR: could not handle arithmetic code!");this.frame.read(this.stream),c=this.stream.get16();do{for(;c!==65498;){switch(c){case 65476:this.huffTable.read(this.stream,this.HuffTab);break;case 65484:throw new Error("Program doesn't support arithmetic coding. (format throw new IOException)");case 65499:this.quantTable.read(this.stream,l.TABLE);break;case 65501:this.restartInterval=this.readNumber()??0;break;case 65504:case 65505:case 65506:case 65507:case 65508:case 65509:case 65510:case 65511:case 65512:case 65513:case 65514:case 65515:case 65516:case 65517:case 65518:case 65519:this.readApp();break;case 65534:this.readComment();break;default:if(c>>8!==255)throw new Error("ERROR: format throw new IOException! (Parser.decode)")}c=this.stream.get16()}switch(this.precision=this.frame.precision,this.components=this.frame.components,this.numBytes||(this.numBytes=Math.round(Math.ceil(this.precision/8))),this.numBytes===1?this.mask=255:this.mask=65535,this.scan.read(this.stream),this.numComp=this.scan.numComp,this.selection=this.scan.selection,this.numBytes===1?this.numComp===3?(this.getter=this.getValueRGB,this.setter=this.setValueRGB,this.output=this.outputRGB):(this.getter=this.getValue8,this.setter=this.setValue8,this.output=this.outputSingle):(this.getter=this.getValue8,this.setter=this.setValue8,this.output=this.outputSingle),this.selection){case 2:this.selector=this.select2;break;case 3:this.selector=this.select3;break;case 4:this.selector=this.select4;break;case 5:this.selector=this.select5;break;case 6:this.selector=this.select6;break;case 7:this.selector=this.select7;break;default:this.selector=this.select1;break}for(i=0;i<this.numComp;i+=1)u=this.scan.components[i].scanCompSel,this.qTab[i]=this.quantTable.quantTables[this.components[u].quantTableSel],this.nBlock[i]=this.components[u].vSamp*this.components[u].hSamp,this.dcTab[i]=this.HuffTab[this.scan.components[i].dcTabSel][0],this.acTab[i]=this.HuffTab[this.scan.components[i].acTabSel][1];for(this.xDim=this.frame.dimX,this.yDim=this.frame.dimY,this.numBytes===1?this.outputData=new Uint8Array(new ArrayBuffer(this.xDim*this.yDim*this.numBytes*this.numComp)):this.outputData=new Uint16Array(new ArrayBuffer(this.xDim*this.yDim*this.numBytes*this.numComp)),s+=1;;){for(f[0]=0,g[0]=0,i=0;i<10;i+=1)n[i]=1<<this.precision-1;if(this.restartInterval===0){for(c=this.decodeUnit(n,f,g);c===0&&this.xLoc<this.xDim&&this.yLoc<this.yDim;)this.output(n),c=this.decodeUnit(n,f,g);break}for(m=0;m<this.restartInterval&&(this.restarting=m===0,c=this.decodeUnit(n,f,g),this.output(n),c===0);m+=1);if(c===0&&(this.markerIndex!==0?(c=65280|this.marker,this.markerIndex=0):c=this.stream.get16()),!(c>=l.RESTART_MARKER_BEGIN&&c<=l.RESTART_MARKER_END))break}c===65500&&s===1&&(this.readNumber(),c=this.stream.get16())}while(c!==65497&&this.xLoc<this.xDim&&this.yLoc<this.yDim&&s===0);return this.outputData}decodeUnit(t,e,r){return this.numComp===1?this.decodeSingle(t,e,r):this.numComp===3?this.decodeRGB(t,e,r):-1}select1(t){return this.getPreviousX(t)}select2(t){return this.getPreviousY(t)}select3(t){return this.getPreviousXY(t)}select4(t){return this.getPreviousX(t)+this.getPreviousY(t)-this.getPreviousXY(t)}select5(t){return this.getPreviousX(t)+(this.getPreviousY(t)-this.getPreviousXY(t)>>1)}select6(t){return this.getPreviousY(t)+(this.getPreviousX(t)-this.getPreviousXY(t)>>1)}select7(t){return(this.getPreviousX(t)+this.getPreviousY(t))/2}decodeRGB(t,e,r){if(this.selector===null)throw new Error("decode hasn't run yet");let o,s,n,i,u,f,g;for(t[0]=this.selector(0),t[1]=this.selector(1),t[2]=this.selector(2),i=0;i<this.numComp;i+=1)for(n=this.qTab[i],o=this.acTab[i],s=this.dcTab[i],u=0;u<this.nBlock[i];u+=1){for(f=0;f<this.IDCT_Source.length;f+=1)this.IDCT_Source[f]=0;let m=this.getHuffmanValue(s,e,r);if(m>=65280)return m;for(t[i]=this.IDCT_Source[0]=t[i]+this.getn(r,m,e,r),this.IDCT_Source[0]*=n[0],g=1;g<64;g+=1){if(m=this.getHuffmanValue(o,e,r),m>=65280)return m;if(g+=m>>4,m&15)this.IDCT_Source[l.IDCT_P[g]]=this.getn(r,m&15,e,r)*n[g];else if(!(m>>4))break}}return 0}decodeSingle(t,e,r){if(this.selector===null)throw new Error("decode hasn't run yet");let o,s,n,i;for(this.restarting?(this.restarting=!1,t[0]=1<<this.frame.precision-1):t[0]=this.selector(),s=0;s<this.nBlock[0];s+=1){if(o=this.getHuffmanValue(this.dcTab[0],e,r),o>=65280)return o;if(n=this.getn(t,o,e,r),i=n>>8,i>=l.RESTART_MARKER_BEGIN&&i<=l.RESTART_MARKER_END)return i;t[0]+=n}return 0}getHuffmanValue(t,e,r){let o,s;if(!this.stream)throw new Error("stream not initialized");if(r[0]<8?(e[0]<<=8,s=this.stream.get8(),s===255&&(this.marker=this.stream.get8(),this.marker!==0&&(this.markerIndex=9)),e[0]|=s):r[0]-=8,o=t[e[0]>>r[0]],o&l.MSB){if(this.markerIndex!==0)return this.markerIndex=0,65280|this.marker;e[0]&=65535>>16-r[0],e[0]<<=8,s=this.stream.get8(),s===255&&(this.marker=this.stream.get8(),this.marker!==0&&(this.markerIndex=9)),e[0]|=s,o=t[(o&255)*256+(e[0]>>r[0])],r[0]+=8}if(r[0]+=8-(o>>8),r[0]<0)throw new Error("index="+r[0]+" temp="+e[0]+" code="+o+" in HuffmanValue()");return r[0]<this.markerIndex?(this.markerIndex=0,65280|this.marker):(e[0]&=65535>>16-r[0],o&255)}getn(t,e,r,o){let s,n;if(this.stream===null)throw new Error("stream not initialized");if(e===0)return 0;if(e===16)return t[0]>=0?-32768:32768;if(o[0]-=e,o[0]>=0){if(o[0]<this.markerIndex&&!this.isLastPixel())return this.markerIndex=0,(65280|this.marker)<<8;s=r[0]>>o[0],r[0]&=65535>>16-o[0]}else{if(r[0]<<=8,n=this.stream.get8(),n===255&&(this.marker=this.stream.get8(),this.marker!==0&&(this.markerIndex=9)),r[0]|=n,o[0]+=8,o[0]<0){if(this.markerIndex!==0)return this.markerIndex=0,(65280|this.marker)<<8;r[0]<<=8,n=this.stream.get8(),n===255&&(this.marker=this.stream.get8(),this.marker!==0&&(this.markerIndex=9)),r[0]|=n,o[0]+=8}if(o[0]<0)throw new Error("index="+o[0]+" in getn()");if(o[0]<this.markerIndex)return this.markerIndex=0,(65280|this.marker)<<8;s=r[0]>>o[0],r[0]&=65535>>16-o[0]}return s<1<<e-1&&(s+=(-1<<e)+1),s}getPreviousX(t=0){if(this.getter===null)throw new Error("decode hasn't run yet");return this.xLoc>0?this.getter(this.yLoc*this.xDim+this.xLoc-1,t):this.yLoc>0?this.getPreviousY(t):1<<this.frame.precision-1}getPreviousXY(t=0){if(this.getter===null)throw new Error("decode hasn't run yet");return this.xLoc>0&&this.yLoc>0?this.getter((this.yLoc-1)*this.xDim+this.xLoc-1,t):this.getPreviousY(t)}getPreviousY(t=0){if(this.getter===null)throw new Error("decode hasn't run yet");return this.yLoc>0?this.getter((this.yLoc-1)*this.xDim+this.xLoc,t):this.getPreviousX(t)}isLastPixel(){return this.xLoc===this.xDim-1&&this.yLoc===this.yDim-1}outputSingle(t){if(this.setter===null)throw new Error("decode hasn't run yet");this.xLoc<this.xDim&&this.yLoc<this.yDim&&(this.setter(this.yLoc*this.xDim+this.xLoc,this.mask&t[0]),this.xLoc+=1,this.xLoc>=this.xDim&&(this.yLoc+=1,this.xLoc=0))}outputRGB(t){if(this.setter===null)throw new Error("decode hasn't run yet");const e=this.yLoc*this.xDim+this.xLoc;this.xLoc<this.xDim&&this.yLoc<this.yDim&&(this.setter(e,t[0],0),this.setter(e,t[1],1),this.setter(e,t[2],2),this.xLoc+=1,this.xLoc>=this.xDim&&(this.yLoc+=1,this.xLoc=0))}setValue8(t,e){if(!this.outputData)throw new Error("output data not ready");R?this.outputData[t]=e:this.outputData[t]=(e&255)<<8|e>>8&255}getValue8(t){if(this.outputData===null)throw new Error("output data not ready");if(R)return this.outputData[t];{const e=this.outputData[t];return(e&255)<<8|e>>8&255}}setValueRGB(t,e,r=0){this.outputData!==null&&(this.outputData[t*3+r]=e)}getValueRGB(t,e){if(this.outputData===null)throw new Error("output data not ready");return this.outputData[t*3+e]}readApp(){if(this.stream===null)return null;let t=0;const e=this.stream.get16();for(t+=2;t<e;)this.stream.get8(),t+=1;return e}readComment(){if(this.stream===null)return null;let t="",e=0;const r=this.stream.get16();for(e+=2;e<r;)t+=this.stream.get8(),e+=1;return t}readNumber(){if(this.stream===null)return null;if(this.stream.get16()!==4)throw new Error("ERROR: Define number format throw new IOException [Ld!=4]");return this.stream.get16()}},h(l,"IDCT_P",[0,5,40,16,45,2,7,42,21,56,8,61,18,47,1,4,41,23,58,13,32,24,37,10,63,17,44,3,6,43,20,57,15,34,29,48,53,26,39,9,60,19,46,22,59,12,33,31,50,55,25,36,11,62,14,35,28,49,52,27,38,30,51,54]),h(l,"TABLE",[0,1,5,6,14,15,27,28,2,4,7,13,16,26,29,42,3,8,12,17,25,30,41,43,9,11,18,24,31,40,44,53,10,19,23,32,39,45,52,54,20,22,33,38,46,51,55,60,21,34,37,47,50,56,59,61,35,36,48,49,57,58,62,63]),h(l,"MAX_HUFFMAN_SUBTREE",50),h(l,"MSB",2147483648),h(l,"RESTART_MARKER_BEGIN",65488),h(l,"RESTART_MARKER_END",65495),l);export{L as ComponentSpec,v as DataStream,_ as Decoder,S as FrameHeader,C as HuffmanTable,B as QuantizationTable,A as ScanComponent,P as ScanHeader,x as Utils};
