import React from 'react'
export default function IconCard({icon, title, children}){
return (
<div className="p-4 border rounded-lg text-center">
<div className="w-12 h-12 bg-[var(--accent)] rounded-full mx-auto flex items-center justify-center text-white mb-2">{icon}</div>
<h4 className="font-semibold">{title}</h4>
<div className="text-sm text-gray-600">{children}</div>
</div>
)
}