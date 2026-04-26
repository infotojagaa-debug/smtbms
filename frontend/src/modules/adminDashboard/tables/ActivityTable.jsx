import React from 'react';
import { Zap, Clock, User, Activity } from 'lucide-react';

const ActivityTable = ({ data }) => {
  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Event</th>
              <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Actor</th>
              <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {data.map((activity) => (
              <tr key={activity.id} className="group hover:bg-slate-50 transition-colors border-b border-slate-50 group-last:border-0">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Zap size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{activity.title}</p>
                      <p className="text-xs text-slate-400 truncate max-w-[200px]">{activity.desc}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                      <User size={12} className="text-slate-500" />
                    </div>
                    <span className="text-sm font-semibold text-slate-600">{activity.author}</span>
                  </div>
                </td>
                <td className="py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5 text-slate-400">
                    <Clock size={12} />
                    <span className="text-[11px] font-bold">
                      {new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <div className="py-12 text-center text-slate-400">
            <Activity className="mx-auto mb-2 opacity-20" size={32} />
            <p className="text-sm font-medium">No recent signals detected.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityTable;
