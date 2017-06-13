		new Vue({
		  el: '#app',
		  data: {
			base:{
				hmax:1.2,
				hmin:0.94,
				alpha:12,
				e:4.2,
				gamma:1.5,
				ap:200,
				L:200,
			},
			  teh:{
				  ok:{
					  name:'1К101У',
					  vpb:4.4,
					  vpm:2.2,
					  bz:0.8,
					  di:0.8,
					  no:42,
					  nrl:2,
					  n:83.1,
					  nz:30,
					  nk:10,
					  nu:0.95,
					  nutr:0.98,
					  nuk:0.7,
					  g:9300,
					  pn:110,
					  q:480,
					  lkr:1.5,
					  psh:0, // погрузочный шиток 1 или 0
					  chema:{
						  pol:0, //1 - верхний, 0-нижний
						  naprav_1:0, //направление движения исполнительного органа: 1 - по часовой стрелке, 0 - против часовой стрелки
						  naprav_2:1, //направление движения исполнительного органа: 1 - по часовой стрелке, 0 - против часовой стрелки
					  }
				  },
				  rez:{
					  name:'ЗР4-80',
					  vk:1.4,
					  lp:8,
					  sigma:83,
					  alpha:8,
					  bp:2,
					  kp:0.7,
					  kl:1.6,
					  kf:0.87,
					  u:0.5,
					  kpr:1,
				  },
				  shnek:[
					  {type:'k', count:4,l:20,beta:50},
					  {type:'k', count:2,l:25,beta:30},
					  {type:'k', count:2,l:35,beta:10},
					  {type:'k', count:2,l:30,beta:5},
					  {type:'з', count:2,l:40,beta:0},
					  {type:'з', count:2,l:40,beta:0},
					  {type:'з', count:2,l:40,beta:0},
					  {type:'з', count:2,l:40,beta:0},
					  {type:'з', count:2,l:40,beta:0},
					  {type:'з', count:2,l:40,beta:0},
					  {type:'з', count:2,l:40,beta:0},
					  {type:'з', count:2,l:40,beta:0},
					  {type:'з', count:2,l:40,beta:0},
					  {type:'з', count:2,l:40,beta:0},
					  {type:'з', count:2,l:40,beta:0},
					  {type:'з', count:2,l:40,beta:0},
					  {type:'з', count:2,l:40,beta:0},
					  {type:'з', count:2,l:40,beta:0},
					  {type:'з', count:2,l:40,beta:0},
					  {type:'з', count:2,l:40,beta:0},
					  {type:'з', count:2,l:0,beta:0}
				  ],
				  shnek_bz:0,
				  motor:{
					  name:'2ЭДКО4-110У5',
					  nc:1500,
					  nn:1470,
					  mk:2500,
					  mn:2500,
					  km:1.3,
					  kkr:0.3,
					  kb:0.7,
					  kpr:1.17
				  }
			  },
			  rezult:{
				  vp:0,
				  Zoz:0,
				  Zz:0,
				  yz:0,
				  deltayz:0,
				  Zok:0,
				  yk:0,
				  deltayk:0,
				  Zk:0,
				  F:[],
				  Pn:[],
				  Pp:[],
				  Ppg:[],
				  graph:[],
				  Vpu:0,
				  Vpd:0,
				  Vkr:0,
				  Vpb:0,
				  Vnk:0,
				  Vrec:0,
				  Ve:0
			  },
			  v:[1,2,3,4,5,6],
			  a:0,
			  b:0,
			  vn:0,
			  Q:0
		  },
			ready(){
				this.drow()
			},
		  methods: {
			  start: function () {
				  tz=0;
				  tk=0;
				  linez=0;
				  linek=0;
				  countz=0;
				  countk=0;
				  betak=0;
				  for(var i=0;i<this.teh.shnek.length;i++){
					if(this.teh.shnek[i].type=='з') {
						linez++;
						tz+=Number(this.teh.shnek[i-1].l)/10;
						countz+=Number(this.teh.shnek[i].count);
					}
					if(this.teh.shnek[i].type=='k') {
						if(this.teh.shnek[i+1].type!='з'){
							linek++;
							tk+=Number(this.teh.shnek[i].l)/10;
						}
						betak+=Number(this.teh.shnek[i].count)*Number(this.teh.shnek[i].beta);
						countk+=Number(this.teh.shnek[i].count);
					}
				  }
				  bz=tz/2/100;
				  bk=(tz+tk/2)/100;
				  console.log('tz',tz);
				  tz=tz/linez;
				  betaz=0;
				  tk=tk/linek;
				  betak=betak/countk;

				  console.log('linez',linez);
				  console.log('bz',bz);
				  console.log(tz,bz,tk,betak,bk);

				  this.rezult.vp=Math.PI*this.teh.ok.n*this.teh.ok.di/60;

				  this.rezult.Zoz=this.check_z('z',tz,betaz,bz);
				  hsr=2*hmax/Math.PI;
				  yob=0.45*this.base.e/(this.base.e-0.6)*this.rezult.Zoz;
				  yo=yob*(9/(this.teh.rez.alpha+2)+0.25);
				  sz=this.teh.rez.kp*this.teh.rez.u*this.teh.rez.bp;
				  cn=0.75*(8*sz+this.teh.rez.bp+3)/Math.sqrt(hsr)/(this.teh.rez.bp+3)/(sz+0.1*this.teh.rez.bp);
				  this.rezult.yz=yo+yob*cn*sz;
				  this.rezult.deltayz=yob*cn*sz
				  this.rezult.Zz=this.rezult.Zoz+0.4*this.rezult.deltayz;

				  console.log('Zoz=',this.rezult.Zoz);
				  console.log('cn=',this.rezult.cn);
				  console.log('deltayz=',this.rezult.deltayz);

				  this.rezult.Zok=this.check_z('k',tk,betak,bk);
				  hsr=2/Math.PI*this.teh.ok.vpb/this.teh.ok.n/this.teh.ok.nrl*100;
				  yob=0.45*this.base.e/(this.base.e-0.6)*this.rezult.Zok;
				  yo=yob*(9/(this.teh.rez.alpha+2)+0.25);
				  cn=0.75*(8*sz+this.teh.rez.bp+3)/Math.sqrt(hsr)/(this.teh.rez.bp+3)/(sz+0.1*this.teh.rez.bp);
				  this.rezult.yk=yo+yob*cn*sz;
				  this.rezult.deltayk=yob*cn*sz
				  this.rezult.Zk=this.rezult.Zok+0.4*this.rezult.deltayk;


				  /*Суммарная средняя сила резания Fu, H на исполнительном органе*/
				  this.rezult.F=[];
				  var Kos=1;
				  var Uohv=180;
				  var Kohv=1;
				   /*К опережающему шнеку*/
				  fu=1/2*Kos*Kohv*(this.rezult.Zz*this.teh.ok.nz+this.rezult.Zk*this.teh.ok.nk);
				  this.rezult.F.push(fu);

				  if(this.teh.ok.chema.pol==1){
					  if(this.teh.ok.chema.naprav_2==0) Kos=0.72;
					  if(this.teh.ok.chema.naprav_2==1) Kos=0.85;
				  }
				  if(this.teh.ok.chema.pol==0){
					  if(this.teh.ok.chema.naprav_2==0) Kos=0.64;
					  if(this.teh.ok.chema.naprav_2==1) Kos=0.75;
				  }
				  Uohv=Math.acos(2*(3/2*this.teh.ok.di - this.hp())/this.teh.ok.di)*180/Math.PI;
				  if(Uohv<=10) Kohv=0.031;
				  else if(Uohv<=20) Kohv=0.062;
				  else if(Uohv<=30) Kohv=0.103;
				  else if(Uohv<=40) Kohv=0.155;
				  else if(Uohv<=50) Kohv=0.217;
				  else if(Uohv<=60) Kohv=0.280;
				  else if(Uohv<=70) Kohv=0.352;
				  else if(Uohv<=75) Kohv=0.4;
				  else if(Uohv<=80) Kohv=0.437;
				  else if(Uohv<=90) Kohv=0.500;
				  else if(Uohv<=100) Kohv=0.601;
				  else if(Uohv<=110) Kohv=0.668;
				  else if(Uohv<=120) Kohv=0.734;
				  else if(Uohv<=130) Kohv=0.800;
				  else if(Uohv<=140) Kohv=0.854;
				  else if(Uohv<=150) Kohv=0.906;
				  else if(Uohv<=160) Kohv=0.952;
				  else if(Uohv<=170) Kohv=0.977;
				  else if(Uohv<=180) Kohv=1;

				  /*К отстающемку шнеку*/
				  fu=1/2*Kohv*Kos*(this.rezult.Zz*this.teh.ok.nz+this.rezult.Zk*this.teh.ok.nk);
				  this.rezult.F.push(fu);
				  console.log('F',this.rezult.F);

				  /*Мощность, соответствующая силам резания на исполнительных органах*/
				  this.rezult.Pn[0]=0;
				  for(var i=0;i<this.rezult.F.length;i++){
					  this.rezult.Pn[0]+=this.rezult.F[i]*this.teh.ok.vpb/1000/this.teh.ok.nu/this.teh.ok.nutr;
				  }
				  this.rezult.Pn[1]=0;
				  for(var i=0;i<this.rezult.F.length;i++){
					  this.rezult.Pn[1]+=this.rezult.F[i]*this.teh.ok.vpm/1000/this.teh.ok.nu/this.teh.ok.nutr;
				  }
				  console.log('Pn',this.rezult.Pn);

				  /*Мощность, соответствующая силам сопротивле¬ния перемещению очистного комбайна*/
				  console.log(Kohv,Kos);
				  this.rezult.Pp=[]
				  yu=1/Math.PI*1*1*(this.rezult.Zz*this.teh.ok.nz+this.rezult.Zk*this.teh.ok.nk)+1/Math.PI*Kohv*Kos*(this.rezult.Zz*this.teh.ok.nz+this.rezult.Zk*this.teh.ok.nk);
				  kf=1.4;
				  f=0.21;
				  yn=kf*(this.teh.ok.g*(f*this.cos(this.base.alpha)+this.sin(this.base.alpha))+yu);
				  console.log('yn',yn);
				  Pp=yn*this.teh.ok.vpb/60000/this.teh.ok.nuk;
				  this.rezult.Pp.push(Pp);
				  Pp=yn*this.teh.ok.vpm/60000/this.teh.ok.nuk;
				  this.rezult.Pp.push(Pp);
				  console.log('Pp',this.rezult.Pp);

				  /*Мощность, развиваемая двигателем при погрузке угля на конвейер*/
				  this.rezult.Ppg=[];
				  if(this.teh.ok.psh==1){
					  C=0;
					  D=350;
				  }
				  else{
					  C=0;
					  D=100;
				  }
				  hob=100*this.teh.ok.vpb/this.teh.ok.n;
				  Fpg=C+D*hob;
				  Ppg=Fpg*this.teh.ok.vpb/1000/this.teh.ok.nu/this.teh.ok.nutr;
				  this.rezult.Ppg.push(Ppg);
				  hob=100*this.teh.ok.vpm/this.teh.ok.n;
				  Fpg=C+D*hob;
				  Ppg=Fpg*this.teh.ok.vpm/1000/this.teh.ok.nu/this.teh.ok.nutr;
				  this.rezult.Ppg.push(Ppg);
				  console.log('Ppg',this.rezult.Ppg);

				  /*Общая нагрузка двигателя*/
				  Pb=this.rezult.Ppg[0]+this.rezult.Pn[0]+this.rezult.Pp[0];
				  Pm=this.rezult.Ppg[1]+this.rezult.Pn[1]+this.rezult.Pp[1];
				  b=(Pb-Pm)/(this.teh.ok.vpb-this.teh.ok.vpm);
				  a=Pb-b*this.teh.ok.vpm;
					console.log(a,b);
					console.log(Pb,Pm);

				  this.a=a;
				  this.b=b;
				  this.create_table_fo_graph(a,b);


			  },
			  check_z:function(type,t,beta,b){
				  hp=this.hp();
				  kot=0.25*this.base.e/(this.base.e-0.8);
				  kotz=kot+(1-1.1/Math.pow((b/hp+1),2));
				  hmax=this.teh.rez.lp/this.teh.rez.kl;
				  if(type=='z')hsr=2*hmax/Math.PI;
				  else hsr=2/Math.PI*this.teh.ok.vpb/this.teh.ok.n/this.teh.ok.nrl*100;
				  topt=(5*hsr/(0.5*hsr+4.5)+0.7*hsr)*1.47*this.base.e/(this.base.e+1.2)+this.teh.rez.vk;
				  kz=0.25+0.66/(hsr+1.3);
				  if(t<=topt){
					  kzz=(1+1.6*Math.pow((t/topt-1),2))*kz;
				  }
				  else{
					  kzz=(1+0.21*hsr*(t/topt-1))*kz;
				  }
				  kyz=0.012*this.teh.rez.sigma+0.42*this.base.e/(this.base.e+3.45);
				  Z=10*this.base.ap*kotz*(0.35*this.teh.rez.bp+0.3)/(this.teh.rez.bp+this.base.e*Math.sqrt(hsr))*hsr*t*kzz*kyz*this.teh.rez.kf*this.teh.rez.kpr*1/this.cos(beta);
				  console.log('hp',hp);
				  console.log('kot',kot);
				  console.log('kotz',kotz);
				  console.log('hmax',hmax);
				  console.log('hsr',hsr);
				  console.log('t',t);
				  console.log('topt',topt);
				  console.log('kz',kz);
				  console.log('kzz',kzz);
				  console.log('kyz',kyz);
				  return Z;
			  },
			  cos:function(v){
				return Math.cos(Math.PI*v/180);
			},
			  sin:function(v){
				return Math.sin(Math.PI*v/180);
			},
			hp:function(){
				return (Number(this.base.hmax)+Number(this.base.hmin))/2
			},
			P:function(a,b,v){
				return a+b*v;
			},
			Qt:function(v){
				hp=this.hp();
				return hp*this.teh.ok.bz*this.base.gamma*v*60;
			},
			Kteh:function(v){
				Kg=0.9 // - коэффициент готовности выемочной машины или комплекса
				Z=0 // удельный расход резцов
				if(this.base.ap<60)Z=5.5;
				else if(this.base.ap<120)Z=9;
				else if(this.base.ap<180)Z=15;
				else if(this.base.ap<240)Z=20;
				else Z=30;
				Z=Z/1000;
				Tmo=0;//при челноковой схеме работы комбайна
				Tko=20// 20 мин
				tp=1.5// 2 мин
				Tzu=this.base.L*this.hp()*this.teh.ok.bz*Z*tp;

				return 1/(1/Kg+(Tmo+Tko+Tzu)/this.base.L*v)
			},
			Qteh:function(v){
				return this.Qt(v)*this.Kteh(v);
			},
			Ke:function(v){
				Top=20//30 мин
				return 1/(1/this.Kteh(v)+Top*v/this.base.L);
			},
			Qe:function(v){
				return this.Qt(v)*this.Ke(v);
			},
			W:function(a,b,v){
				return this.P(a,b,v)/this.Qt(v);
			},
			Qpv:function(a,b,v){
				var rez=36*this.Qt(v)*Math.pow(this.teh.ok.pn/this.P(a,b,v),2)/60;
				if(this.teh.ok.pn<this.P(a,b,v)) return rez;
				return this.Qt(v);

				/*return 36*this.Qt(v)*Math.pow(this.teh.ok.pn/this.P(a,b,v),2)/60;*/
			},
			  Qg(x1,x2,y1,y2,x){
				  var w=x2-x1, h=y1-y2;
				  var rx=1-(w-x+x1)/w;
				  var r=Math.pow(rx,1/2.5);
				  var rv=y1-h*r;
				  return rv
			  },
			  Ve: function(a,b,vd){
				  var start=vd;
				  var end=Math.ceil(vd);
				  var a1=start, a2=end, b1=this.Qt(a1),b2=this.Qpv(this.a,this.b,a2);
				  var vd=end;
				  if(this.Qpv(a,b,start)==this.Qt(start)){
					  if(this.Qg(a1,a2,b1,b2,vd)<this.Qe(vd)){
						  var d=0.001;var length=1/d;
						  for(var i=1;i<=length;i++){
							  var v=vd-i*d;
							  if(this.Qg(a1,a2,b1,b2,v)>=this.Qe(v)){
								  this.rezult.Ve=v;
								  break;
							  }
						  }
					  }
					  else this.Ve(a,b,vd+1);
				  }
				  else{
					  if(this.Qpv(a,b,vd)<this.Qe(vd)){
						  var d=0.001;var length=1/d;
						  for(var i=1;i<=length;i++){
							  var v=vd-i*d;
							  if(this.Qpv(a,b,v)>=this.Qe(v)){
								  this.rezult.Ve=v;
								  break;
							  }
						  }
					  }
					  else this.Ve(a,b,vd+1);
				  }
			  },
			create_table_fo_graph:function(a,b){
				this.rezult.graph=[];
				for(var k=0;k<this.v.length;k++){
					v=this.v[k];
					this.rezult.graph.push({
						v:v,
						P:this.P(a,b,v),
						Kteh:this.Kteh(v),
						Ke:this.Ke(v),
						Qt:this.Qt(v),
						Qteh:this.Qteh(v),
						Qe:this.Qe(v),
						W:this.W(a,b,v),
						Qpv:this.Qpv(a,b,v)
					})
				}
			},
			removeShnekLine:function(index){
				this.teh.shnek.splice(index,1);
			},
			addZLine:function(){
				this.teh.shnek.splice(this.teh.shnek.length,0,{type:'з', count:2,l:0,beta:0});
			},
			addKLine:function(){
				this.teh.shnek.splice(0,0,{type:'к', count:2,l:0,beta:0});
			},
		  	Pu(){
				Mmf=0.72*this.teh.motor.mk;
				Mu=Mmf*this.teh.motor.kpr/this.teh.motor.km/(1+this.teh.motor.kkr*this.teh.motor.kb);
				nu=this.teh.motor.nc-Mu*(this.teh.motor.nc-this.teh.motor.nn)/this.teh.motor.mn;
				return Mu*nu/9550;


			},
			  ShnekGrafConvert(){
				  var canvas = document.getElementById('graf_shnek');
				  var dataURL = canvas.toDataURL();
				  window.open(dataURL,'newwin','top=15, left=20, menubar=0, toolbar=0, location=0, directories=0, status=0, scrollbars=0, resizable=0, width='+canvas.width+', height='+canvas.height);
			  },
			  NomogrammConvert(){
				  var canvas = document.getElementById('nomogramm');
				  var dataURL = canvas.toDataURL();
				  window.open(dataURL,'newwin','top=15, left=20, menubar=0, toolbar=0, location=0, directories=0, status=0, scrollbars=0, resizable=0, width='+canvas.width+', height='+canvas.height);
			  },
			  showShnekGraf(){
				  this.drow_shnek();
				  $('#graf_shnek_modal').modal('show');
			  },
			drow_shnek(){
				var canvas = document.getElementById('graf_shnek');
				var height=0;
				var width=0;
				var h=20;
				var count_z=0;
				for(var i=0;i<this.teh.shnek.length;i++){
					height+=Number(this.teh.shnek[i].l);
					if(this.teh.shnek[i].type=='з'){
						width+=h;
						count_z++;
					}
				}
				canvas.height=height+80;
				canvas.width=width*this.teh.ok.nrl+120;
				if(canvas.width<840){
					canvas.width=840;
				}
				h=(canvas.width-80)/this.teh.ok.nrl/count_z;
				width=(canvas.width-120)/this.teh.ok.nrl;


				var obCanvas = canvas.getContext('2d');
				obCanvas.fillStyle = '#fff';
				obCanvas.fillRect( 0, 0, canvas.width, canvas.height );

				var count_k=0;
				for(var i=0;i<this.teh.shnek.length;i++){
					if(this.teh.shnek[i].type=='k'){
						count_k+=Number(this.teh.shnek[i].count);
					}
				}
				var count_k_line=0;
				for(var i=0;i<this.teh.shnek.length;i++){
					if(this.teh.shnek[i].type=='k'){
						count_k_line++;
					}
				}

				obCanvas.beginPath();
				obCanvas.lineWidth = 1;
				obCanvas.fillStyle = '#000000';
				obCanvas.font = "14px Arial";
				obCanvas.strokeStyle = '#000000';
				var height=20;
				var width_shnek=0;
				for(var i=0;i<this.teh.shnek.length;i++){
					var height_del=0;

					if(i>0) height_del=Number(this.teh.shnek[i-1].l);
					height+=height_del;
					width_shnek+=height_del;
					obCanvas.moveTo(60, height);
					obCanvas.lineTo(canvas.width-23, height);
					if(i<this.teh.shnek.length-1)
						obCanvas.fillText(this.teh.shnek[i].l,42, height+Number(this.teh.shnek[i].l)/2+5);
				}
				obCanvas.stroke();

				obCanvas.textAlign = "left";
				this.teh.shnek_bz=height-20;
				for(var f=0;f<this.teh.ok.nrl;f++){
					var height=20;
					var k=0,l=0;
					for(var i=0;i<this.teh.shnek.length;i++){
						if(i>0)height+=Number(this.teh.shnek[i-1].l);
						if(this.teh.shnek[i].type=='з'){
							obCanvas.beginPath();
							obCanvas.fillStyle = '#fff';
							obCanvas.arc(65+k*h+width*f, height, 4, 0, 3*Math.PI, false);
							obCanvas.fill();
							obCanvas.lineWidth = 2;
							obCanvas.strokeStyle = '#000000';
							obCanvas.stroke();
							k++;
						}

						if(this.teh.shnek[i].type=='k'){
							var count=count_k/this.teh.ok.nrl;
							obCanvas.fillStyle = '#000';
							obCanvas.fillText(this.teh.shnek[i].beta+'°',canvas.width-23, height+3);
							var del=width/count*0.8;
							for(var j=0;j<Number(this.teh.shnek[i].count)/this.teh.ok.nrl;j++){
								var x=(j>0)? count_k_line*del:0;
								obCanvas.beginPath();
								obCanvas.fillStyle = '#000';
								obCanvas.arc(canvas.width-width*f-width*0.2-60-(l*del+5+x), height, 4, 0, 3*Math.PI, false);
								obCanvas.fill();
							}
							l++;
						}
					}
				}

				//Отрисовка значения диаметра и.о.
				obCanvas.beginPath()
				obCanvas.lineWidth = 1;
				obCanvas.fillStyle = '#000';
				obCanvas.strokeStyle = '#000000';
				obCanvas.moveTo(60, width_shnek+20+20);
				obCanvas.lineTo(canvas.width-20, height+20);
				obCanvas.moveTo(canvas.width-20, height);
				obCanvas.lineTo(canvas.width-20, height+27);
				obCanvas.moveTo(60, height);
				obCanvas.lineTo(60, height+27);
				obCanvas.stroke();

				obCanvas.beginPath();
				obCanvas.moveTo(60, height+20); // первая внешняя точка
				obCanvas.lineTo(68, height+15); //вторая внешняя точка
				obCanvas.lineTo(68, height+25); //третья внешняя точка
				obCanvas.fill();

				obCanvas.beginPath();
				obCanvas.moveTo(canvas.width-20, height+20); // первая внешняя точка
				obCanvas.lineTo(canvas.width-28, height+15); //вторая внешняя точка
				obCanvas.lineTo(canvas.width-28, height+25); //третья внешняя точка
				obCanvas.fill();

				obCanvas.textAlign = "center";
				obCanvas.fillText('диаметр и.о. = '+this.teh.ok.di+' м.',canvas.width/2+30, canvas.height-20);

				//Отрисовка значения ширины захвата и.о.
				obCanvas.beginPath()
				obCanvas.lineWidth = 1;
				obCanvas.moveTo(30, 20);
				obCanvas.lineTo(30, height);
				obCanvas.moveTo(25, 20);
				obCanvas.lineTo(60, 20);
				obCanvas.moveTo(25, height);
				obCanvas.lineTo(60, height);
				obCanvas.stroke();

				obCanvas.beginPath();
				obCanvas.moveTo(30, 20); // первая внешняя точка
				obCanvas.lineTo(35, 28); //вторая внешняя точка
				obCanvas.lineTo(25, 28); //третья внешняя точка
				obCanvas.fill();

				obCanvas.beginPath();
				obCanvas.moveTo(30, height); // первая внешняя точка
				obCanvas.lineTo(35, height-8); //вторая внешняя точка
				obCanvas.lineTo(25, height-8); //третья внешняя точка
				obCanvas.fill();

				obCanvas.translate(20, canvas.height/2-40);
				obCanvas.rotate(-Math.PI/2);
				obCanvas.textAlign = "center";
				obCanvas.fillText(width_shnek,0, 0);
			},
			drow(){
				this.start();
				this.drow_shnek();
				var canvas = document.getElementById('nomogramm');
				var step_x=100;
				canvas.width=step_x+this.v[this.v.length-1]*step_x+step_x;
				canvas.height=700;
				var obCanvas = canvas.getContext('2d');
				obCanvas.fillStyle = '#fff';
				obCanvas.fillRect( 0, 0, canvas.width, canvas.height );

				obCanvas.beginPath();
				obCanvas.lineWidth = 1;
				obCanvas.font = "13px Arial";
				obCanvas.strokeStyle = '#000000';
				obCanvas.fillStyle = '#000000';
				obCanvas.moveTo(step_x-step_x/2, canvas.height/2);
				obCanvas.lineTo(this.v[this.v.length-1]*step_x+step_x, canvas.height/2);

				obCanvas.moveTo(step_x, 50);
				obCanvas.lineTo(step_x, canvas.height-50);

				obCanvas.moveTo(step_x-step_x/2, 50);
				obCanvas.lineTo(step_x-step_x/2, canvas.height/2);

				for(var i=1;i<this.v.length;i++){
					obCanvas.moveTo(step_x+step_x*i, canvas.height/2-3);
					obCanvas.lineTo(step_x+step_x*i, canvas.height/2+3);
					obCanvas.fillText(this.v[i-1],step_x+step_x*i-4, canvas.height/2-4);
				}

				var lengthGraph=this.rezult.graph.length-1;
				var pu=this.Pu();
				var p_max=pu;
				var delP=(canvas.height/2-100)/p_max;

				var del_y=50;
				var del_count=Math.ceil(p_max/del_y);
				for(var i=0;i<=del_count;i++){
					if(i*del_y*delP<canvas.height/2-50){
						obCanvas.moveTo(step_x-3, canvas.height/2-i*del_y*delP);
						obCanvas.lineTo(step_x+3, canvas.height/2-i*del_y*delP);
						obCanvas.textAlign = "right";
						obCanvas.fillText(i*del_y,step_x-4, canvas.height/2-i*del_y*delP);
					}
				}

				obCanvas.textAlign = "left";
				obCanvas.font = "14px Arial";
				obCanvas.fillText("V, м/мин",this.v[this.v.length-1]*step_x+step_x, canvas.height/2);
				obCanvas.fillText("W, кВт*ч/m",step_x-90, 45);
				obCanvas.fillText("P, кВт",step_x-10, 45);
				obCanvas.fillText("Q, m/ч",step_x-10, canvas.height-35);
				obCanvas.fillText("Ру="+pu.toFixed(1),this.v[this.v.length-1]*step_x+step_x, canvas.height/2-pu*delP);
				obCanvas.fillText("Рм",step_x+step_x*this.teh.ok.vpm+1, canvas.height/2-4);
				obCanvas.fillText("Рб",step_x+step_x*this.teh.ok.vpb+1, canvas.height/2-4);


				obCanvas.stroke();

				obCanvas.beginPath();
				obCanvas.strokeStyle = 'blue';
				/*Drow P*/
				obCanvas.moveTo(
					step_x+step_x*this.v[0],
					canvas.height/2- this.rezult.graph[0].P*delP
				);
				obCanvas.lineTo(
					step_x+step_x*this.v[this.v.length-1],
					canvas.height/2-this.rezult.graph[lengthGraph].P*delP
				);
				obCanvas.fillText("Р",this.v[this.v.length-1]*step_x+step_x, canvas.height/2-this.rezult.graph[lengthGraph].P*delP);
				obCanvas.stroke();

				var delx=0.05;
				var length=(this.v[this.v.length-1]-this.v[0])/delx;

				obCanvas.beginPath();
				obCanvas.strokeStyle = 'orange';
				/*Drow W*/
				var Wmax=Math.max.apply(null, [this.rezult.graph[lengthGraph].W,this.rezult.graph[0].W]);
				Wmax=Wmax-Wmax/10;
				var del=(canvas.height/2-100)/Wmax;
				for(var i=0;i<length;i++){
					var x1=this.v[0]+i*delx;
					var x2=this.v[0]+(i+1)*delx;
					obCanvas.moveTo(
						step_x+step_x*x1,
						canvas.height/2- this.W(this.a,this.b,x1)*del
					);
					obCanvas.lineTo(
						step_x+step_x*x2,
						canvas.height/2- this.W(this.a,this.b,x2)*del
					);
				}
				obCanvas.fillText("W",this.v[this.v.length-1]*step_x+step_x, canvas.height/2- this.W(this.a,this.b,x2)*del);
				obCanvas.stroke();

				obCanvas.beginPath();
				obCanvas.strokeStyle = '#000000';
				obCanvas.fillStyle = '#000000';
				var del_y=0.25;
				var del_count=Math.ceil(Wmax/del_y);
				for(var i=0;i<=del_count;i++){
					if(i*del_y*del<canvas.height/2-50){
						obCanvas.moveTo(step_x-50-3, canvas.height/2-i*del_y*del);
						obCanvas.lineTo(step_x-50+3, canvas.height/2-i*del_y*del);
						obCanvas.textAlign = "right";
						obCanvas.fillText(i*del_y,step_x-50-4, canvas.height/2-i*del_y*del);
					}
				}
				obCanvas.stroke();
				obCanvas.textAlign = "left";

				var length=(this.v[this.v.length-1])/delx;

				/*Drow Qt*/
				var Qt=this.rezult.graph[lengthGraph].Qt;
				var del=(canvas.height/2-100)/Qt;

				obCanvas.beginPath();
				obCanvas.strokeStyle = '#000';
				var del_y=100;
				var del_count=Math.ceil(Qt/del_y);
				for(var i=0;i<=del_count;i++){
					if(i*del_y*del<canvas.height/2-50){
						obCanvas.moveTo(step_x-3, canvas.height/2+i*del_y*del);
						obCanvas.lineTo(step_x+3, canvas.height/2+i*del_y*del);
						obCanvas.textAlign = "right";
						obCanvas.fillText(i*del_y,step_x-4, canvas.height/2+i*del_y*del);
					}
				}
				obCanvas.stroke();

				obCanvas.beginPath();
				obCanvas.textAlign = "left";
				obCanvas.strokeStyle = 'green';
				for(var i=0;i<length;i++){
					var x1=i*delx;
					var x2=(i+1)*delx;
					obCanvas.moveTo(
						step_x+step_x*x1,
						canvas.height/2+ this.Qt(x1)*del
					);
					obCanvas.lineTo(
						step_x+step_x*x2,
						canvas.height/2+this.Qt(x2)*del
					);
				}
				obCanvas.fillText("Qt",this.v[this.v.length-1]*step_x+step_x, canvas.height/2+this.Qt(x2)*del);
				obCanvas.stroke();

				obCanvas.beginPath();
				obCanvas.strokeStyle = 'red';
				/*Drow Qteh*/
				for(var i=0;i<length;i++){
					var x1=i*delx;
					var x2=(i+1)*delx;
					obCanvas.moveTo(
						step_x+step_x*x1,
						canvas.height/2+ this.Qteh(x1)*del
					);
					obCanvas.lineTo(
						step_x+step_x*x2,
						canvas.height/2+this.Qteh(x2)*del
					);
				}
				obCanvas.fillText("Qteh",this.v[this.v.length-1]*step_x+step_x, canvas.height/2+this.Qteh(x2)*del);
				obCanvas.stroke();

				obCanvas.beginPath();
				obCanvas.strokeStyle = 'brown';
				/*Drow Qe*/
				for(var i=0;i<length;i++){
					var x1=i*delx;
					var x2=(i+1)*delx;
					obCanvas.moveTo(
						step_x+step_x*x1,
						canvas.height/2+ this.Qe(x1)*del
					);
					obCanvas.lineTo(
						step_x+step_x*x2,
						canvas.height/2+this.Qe(x2)*del
					);
				}
				obCanvas.fillText("Qэ",this.v[this.v.length-1]*step_x+step_x, canvas.height/2+this.Qe(x2)*del);
				obCanvas.stroke();

				obCanvas.beginPath();
				obCanvas.strokeStyle = 'blue';
				/*Drow Qpv*/
				var start=0;
				for(var i=0;i<length;i++){
					var x1=i*delx;
					if(this.Qpv(this.a,this.b,x1)==this.Qt(x1)) start=i
				}
				var end=Math.ceil(start*delx)/delx;
				var a1=start*delx, a2=end*delx, b1=this.Qt(a1),b2=this.Qpv(this.a,this.b,a2);
				for(var i=start;i<end;i++){
					var x1=i*delx;
					var x2=(i+1)*delx;
					obCanvas.moveTo(
						step_x+step_x*x1,
						canvas.height/2+ this.Qg(a1,a2,b1,b2,x1)*del
					);
					obCanvas.lineTo(
						step_x+step_x*x2,
						canvas.height/2+this.Qg(a1,a2,b1,b2,x2)*del
					);
				}
				for(var i=end;i<length;i++){
					var x1=i*delx;
					var x2=(i+1)*delx;
					obCanvas.moveTo(
						step_x+step_x*x1,
						canvas.height/2+ this.Qpv(this.a,this.b,x1)*del
					);
					obCanvas.lineTo(
						step_x+step_x*x2,
						canvas.height/2+this.Qpv(this.a,this.b,x2)*del
					);
				}

				obCanvas.fillText("Qпв",this.v[this.v.length-1]*step_x+step_x+35, canvas.height/2+this.Qpv(this.a,this.b,x2)*del);
				obCanvas.stroke();


				obCanvas.beginPath();
				obCanvas.arc(step_x+step_x*this.rezult.vp, canvas.height/2, 3, 0, 2*Math.PI, false);
				obCanvas.fillStyle = '#000';
				obCanvas.fill();
				obCanvas.fillText("Vp",step_x+step_x*this.rezult.vp-5, canvas.height/2-4);


				/*Ограничения*/

				obCanvas.beginPath();
				obCanvas.strokeStyle = 'red';
				obCanvas.lineWidth = 1;
				obCanvas.moveTo(
					step_x+step_x*this.v[0],
					canvas.height/2- pu*delP
				);
				obCanvas.lineTo(
					step_x+step_x*this.v[this.v.length-1],
					canvas.height/2-pu*delP
				);


				Pmin=this.P(this.a,this.b,this.teh.ok.vpm);
				obCanvas.moveTo(
					step_x+step_x*this.teh.ok.vpm,
					canvas.height/2- Pmin*delP
				);
				obCanvas.lineTo(
					step_x+step_x*this.teh.ok.vpm,
					canvas.height/2
				);

				Pmax=this.P(this.a,this.b,this.teh.ok.vpb);
				obCanvas.moveTo(
					step_x+step_x*this.teh.ok.vpb,
					canvas.height/2- Pmax*delP
				);
				obCanvas.lineTo(
					step_x+step_x*this.teh.ok.vpb,
					canvas.height/2
				);
				this.rezult.Vpb=this.teh.ok.vpb;

				Vpu=(this.Pu()-this.a)/this.b;
				if(this.v[this.v.length-1]*step_x>step_x*Vpu+1)
				{
					obCanvas.moveTo(
						step_x + step_x * Vpu,
						50
					);
					obCanvas.lineTo(
						step_x + step_x * Vpu,
						canvas.height - 50
					);
				}
				console.log('Vpu',Vpu);
				this.rezult.Vpu=Vpu;
				if(this.v[this.v.length-1]*step_x>step_x*Vpu+1) obCanvas.fillText("Vpy",step_x+step_x*Vpu+1, canvas.height/2-4);

				Vpd=this.teh.ok.n*this.teh.ok.nrl*this.teh.rez.lp/100;
				obCanvas.moveTo(
					step_x+step_x*Vpd,
					50
				);
				obCanvas.lineTo(
					step_x+step_x*Vpd,
					canvas.height-50
				);
				console.log('Vpd',Vpd);
				this.rezult.Vpd=Vpd;
				obCanvas.fillText("Vnlp",step_x+step_x*Vpd+1, canvas.height/2-4);

				hp=this.hp();
				Vnk=1.25/100*this.teh.ok.q/this.base.gamma/hp/this.teh.ok.bz;
				obCanvas.moveTo(
					step_x+step_x*Vnk,
					50
				);
				obCanvas.lineTo(
					step_x+step_x*Vnk,
					canvas.height-50
				);
				console.log('Vnk',Vnk);
				this.rezult.Vnk=Vnk;
				obCanvas.fillText("Vnk",step_x+step_x*Vnk+1, canvas.height/2-4);


				K=0.7;/*К - коэффициент, учитывающий горно-геологические условия, принимается: 1-0,9 - в благоприятных условиях; 0,9-0,8 - в средних; 0,8-0,6 - в неблагоприятных условиях (кровля не допускает существенно¬го отставания крепи и другие условия)*/
				Vkr=this.teh.ok.lkr/0.2*K;
				obCanvas.moveTo(
					step_x+step_x*Vkr,
					50
				);
				obCanvas.lineTo(
					step_x+step_x*Vkr,
					canvas.height-50
				);
				console.log('Vkr',Vkr);
				this.rezult.Vkr=Vkr;
				obCanvas.fillText("Vkr",step_x+step_x*Vkr+1, canvas.height/2-4);

				obCanvas.stroke();


				this.Ve(a,b,start*delx);
				Ve=this.rezult.Ve;
				obCanvas.moveTo(
					step_x+step_x*Ve,
					canvas.height/2+this.Qe(Ve)*del
				);
				obCanvas.lineTo(
					step_x+step_x*Ve,
					canvas.height/2
				);
				console.log('Ve',Ve);
				obCanvas.fillText("Ve",step_x+step_x*Ve+1, canvas.height/2-4);
				obCanvas.stroke();

				this.rezult.Vrec=Math.min.apply(null,[this.rezult.Vpu,this.rezult.Vpd,this.rezult.Vkr,this.rezult.Vpb,this.rezult.Vnk,this.rezult.vp,this.rezult.Ve]).toFixed(2);
				this.vn=this.rezult.Vrec;
				this.getQ();


			},
			  getQ(){
				  var T=6; //продолжительность смены, ч
				  var tpz=2*0.2;  //2(0,17...0,25) затраты времени на подготовительно-заключительные операции, ч;
				  var tpv=0; //затраты времени на взрывание и проветривание забоя, ч;
				  console.log(this.Qt(Number(this.vn)))
				  console.log(this.Kteh(Number(this.vn)))
				  this.Q=Math.ceil((T-tpz)*this.Qt(Number(this.vn))*this.Kteh(Number(this.vn)));
			  }
		  },

		})