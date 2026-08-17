(function(global){'use strict';
const VERSION='0.1-demo';
const ROLES={
  OPS_ASSISTANT:{title:'Operaciones / soporte',mission:'Reducir carga operativa repetitiva manteniendo escalados y decisiones sensibles bajo control del fundador.',outcomes:['Mantener la cola operativa al día','Preparar documentación y seguimientos sin ejecutar decisiones sensibles','Escalar incidencias y excepciones con contexto suficiente'],competencies:['Orden y seguimiento','Comunicación clara','Criterio para escalar','Disciplina documental']},
  PART_TIME_SPECIALIST:{title:'Especialista part-time',mission:'Aportar criterio especializado en casos definidos sin sustituir la decisión final del fundador.',outcomes:['Resolver tareas especializadas dentro del alcance definido','Documentar hallazgos y límites','Escalar excepciones o decisiones de alto impacto'],competencies:['Especialización práctica','Capacidad de síntesis','Gestión de límites','Trazabilidad']},
  FULL_TIME_OPERATOR:{title:'Operaciones full-time',mission:'Aumentar capacidad operativa diaria preservando controles, calidad y supervisión del fundador.',outcomes:['Gestionar cartera operativa rutinaria','Mantener SLA internos y documentación','Escalar riesgos, quejas y decisiones sensibles'],competencies:['Gestión de volumen','Priorización','Atención al cliente','Escalado responsable']}
};
function build(profileKey,context){context=context||{};const r=ROLES[profileKey]||ROLES.OPS_ASSISTANT;const interviewQuestions=[
  'Cuéntame un caso en el que tuviste que priorizar varias tareas urgentes. ¿Cómo decidiste el orden?',
  'Describe una situación en la que decidiste escalar un problema en vez de resolverlo por tu cuenta.',
  '¿Cómo documentas una gestión para que otra persona pueda continuarla sin perder contexto?',
  '¿Qué harías si un cliente pide una acción que está fuera de tu autoridad?',
  '¿Cómo comprobarías que una tarea repetitiva se puede automatizar sin perder control ni calidad?'
];
return {version:VERSION,profile:profileKey,title:r.title,mission:r.mission,outcomes:r.outcomes.slice(),competencies:r.competencies.slice(),scorecard:r.competencies.map(x=>({criterion:x,scale:'1-5',owner:'FOUNDER'})),interviewQuestions,context:{operations:Number(context.operations||0),humanMinutesPerOperation:Number(context.humanMinutesPerOperation||0),hiringSignal:String(context.hiringSignal||'NO_DATA')},decisionOwner:'FOUNDER',interviewOwner:'FOUNDER',offerOwner:'FOUNDER',candidateRankingAllowed:false,automatedCandidateDecision:false,autoInterviewAllowed:false,autoOfferAllowed:false,noHiringAction:true,noFinancialCommitment:true,persistentStorage:false,containsCandidatePersonalData:false};}
global.FIACOFounderHiringKit={version:VERSION,roles:ROLES,build};
})(typeof window!=='undefined'?window:globalThis);
