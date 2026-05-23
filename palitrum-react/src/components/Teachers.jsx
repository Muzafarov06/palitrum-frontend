import React from 'react'


export default function Teachers({items=[]}){
return (
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
{items.map(t=> (
<div key={t.id} className="border rounded-lg p-4 text-center">
<img src={t.img||'/placeholder.jpg'} className="w-32 h-32 rounded-full mx-auto object-cover"/>
<h4 className="mt-3 font-semibold">{t.name}</h4>
<div className="text-sm text-gray-600">{t.role}</div>
</div>
))}
</div>
)
}