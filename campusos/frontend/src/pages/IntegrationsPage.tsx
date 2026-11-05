import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Radio,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  ShieldCheck,
  ExternalLink,
  Upload,
  CheckCircle2,
  XCircle,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { PlatformConnection, SyncReport } from '../types';
import { format } from 'date-fns';

export const IntegrationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [syncReport, setSyncReport] = useState<SyncReport | null>(null);

  const { data: platforms, isLoading } = useQuery({
    queryKey: ['platforms-status'],
    queryFn: api.getPlatformsStatus,
  });

  const syncAllMutation = useMutation({
    mutationFn: api.syncAll,
    onSuccess: (report) => {
      setSyncReport(report);
      queryClient.invalidateQueries({ queryKey: ['platforms-status'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-focus'] });
    },
  });

  const connectMutation = useMutation({
    mutationFn: ({ platform, payload }: { platform: string; payload: any }) =>
      api.connectPlatform(platform, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platforms-status'] });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: api.disconnectPlatform,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platforms-status'] });
    },
  });

  const getPlatformInfo = (platformName: string) => {
    switch (platformName) {
      case 'google_classroom':
        return {
          title: 'Google Classroom',
          code: 'G',
          color: 'bg-emerald-600',
          desc: 'Synchronize coursework, assignment instructions, and due dates from classroom.google.com.',
        };
      case 'microsoft_teams':
        return {
          title: 'Microsoft Teams (VIT Tenant)',
          code: 'T',
          color: 'bg-indigo-600',
          desc: 'Import assignment announcements and teacher notices using Microsoft Graph education API.',
        };
      case 'moodle':
        return {
          title: 'VIT Moodle LMS (lms.vit.ac.in)',
          code: 'M',
          color: 'bg-blue-600',
          desc: 'Course assessment submissions, digital assignment deadlines, and online quiz schedules.',
        };
      case 'vtop':
        return {
          title: 'VTOP Student Portal',
          code: 'V',
          color: 'bg-amber-600',
          desc: 'Attendance thresholds, grade history, and FFCS timetable. (Official direct API unavailable).',
        };
      case 'vit_colab':
        return {
          title: 'vitColab Coding Hub',
          code: 'C',
          color: 'bg-teal-600',
          desc: 'Lab programming test schedules, test case evaluations, and coding milestones.',
        };
      case 'ipilot':
        return {
          title: 'iPilot Lab Assessment',
          code: 'iP',
          color: 'bg-slate-700',
          desc: 'Practical lab exam timings, coding batches, and viva session allocations.',
        };
      default:
        return {
          title: platformName,
          code: 'P',
          color: 'bg-gray-600',
          desc: 'External campus service connector.',
        };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#176d50] bg-[#e7f7ef] px-2.5 py-1 rounded-full">
            <CheckCircle size={12} /> Connected & Synced
          </span>
        );
      case 'sync_failed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
            <AlertCircle size={12} /> Sync Error
          </span>
        );
      case 'unavailable':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
            Integration Unavailable
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#64748b] bg-[#f1f5f9] px-2.5 py-1 rounded-full">
            Not Connected
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#e9edf2]">
        <div>
          <div className="text-[10px] font-bold tracking-widest text-[#728399] uppercase mb-1.5">
            CAMPUS DATA PIPELINE
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#17263d] tracking-tight">
            Platform Integrations
          </h1>
          <p className="text-xs text-[#6e7d91] mt-1">
            Connect institutional academic services for automated due date synchronization.
          </p>
        </div>

        <button
          onClick={() => syncAllMutation.mutate()}
          disabled={syncAllMutation.isPending}
          className="px-5 py-2.5 bg-[#176d50] hover:bg-[#12583f] text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
        >
          <RefreshCw size={15} className={syncAllMutation.isPending ? 'animate-spin' : ''} />
          <span>{syncAllMutation.isPending ? 'Synchronizing Platforms...' : 'SYNC ALL PLATFORMS'}</span>
        </button>
      </div>

      {/* Security Disclaimer Note */}
      <div className="bg-[#f0f6fb] border border-[#d8e6f3] rounded-2xl p-4 flex items-start gap-3 text-xs text-[#334e68]">
        <ShieldCheck size={20} className="text-[#176d50] flex-none mt-0.5" />
        <div className="space-y-1">
          <strong className="block font-semibold text-[#1e293b]">
            University Credential Safety Policy
          </strong>
          <p className="text-[11px] text-[#486581] leading-relaxed">
            CampusOS adheres to standard OAuth2 token delegation protocols and university API guidelines.
            Never provide your VTOP, Microsoft, or Google password to third-party tools. If an official university API
            is unavailable (such as direct VTOP credentials), the platform is transparently labelled as unavailable with safe
            manual import options.
          </p>
        </div>
      </div>

      {/* Connectors List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-[#8c9cae]">Loading integration states...</div>
        ) : (
          platforms?.map((p) => {
            const info = getPlatformInfo(p.platform_name);
            const isConnected = p.auth_status === 'connected';
            const isUnavailable = p.auth_status === 'unavailable';

            return (
              <div
                key={p.platform_name}
                className="bg-white border border-[#e5ebf0] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl ${info.color} text-white flex items-center justify-center font-heading font-extrabold text-sm flex-none shadow-xs`}
                  >
                    {info.code}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-heading font-bold text-sm text-[#1e293b]">{info.title}</h3>
                      {getStatusBadge(p.auth_status)}
                    </div>
                    <p className="text-[11px] text-[#64748b] mt-0.5 max-w-xl">{info.desc}</p>

                    <div className="flex items-center gap-3 text-[10px] text-[#94a3b8] mt-2">
                      {p.last_synced_at ? (
                        <span>Last sync: {format(new Date(p.last_synced_at), 'd MMM, h:mm a')}</span>
                      ) : (
                        <span>Never synchronized</span>
                      )}
                      {p.last_error_message && (
                        <>
                          <span>•</span>
                          <span className="text-amber-700">{p.last_error_message}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
                  {isUnavailable ? (
                    <button
                      onClick={() => alert('Official VTOP API integration is not publicly exposed by VIT. Please use the Manual Academic Event Entry or Timetable creation forms.')}
                      className="px-3 py-1.5 bg-[#f8fafc] border border-[#d8e1e8] text-[#64748b] rounded-xl text-xs font-semibold hover:bg-[#f1f5f9] transition"
                    >
                      Manual Import Guide
                    </button>
                  ) : isConnected ? (
                    <>
                      <button
                        onClick={() => api.syncPlatform(p.platform_name).then(() => queryClient.invalidateQueries())}
                        className="px-3.5 py-1.5 bg-[#f8fafc] border border-[#d8e1e8] text-[#1e293b] rounded-xl text-xs font-semibold hover:bg-[#f1f5f9] transition"
                      >
                        Sync Now
                      </button>
                      <button
                        onClick={() => disconnectMutation.mutate(p.platform_name)}
                        className="px-3.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-xl font-semibold transition"
                      >
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() =>
                        connectMutation.mutate({
                          platform: p.platform_name,
                          payload: { email: 'student@vitstudent.ac.in', token: 'oauth2_token' },
                        })
                      }
                      className="px-4 py-2 bg-[#176d50] hover:bg-[#12583f] text-white rounded-xl text-xs font-bold transition shadow-xs"
                    >
                      Connect & Authorize
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Sync Summary Modal */}
      {syncReport && (
        <div className="fixed inset-0 bg-[#101b2d]/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#e2e8f0]">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0f3f6]">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={20} className="text-[#176d50]" />
                <h2 className="font-heading font-extrabold text-base text-[#1e293b]">
                  Synchronization Report
                </h2>
              </div>
              <button onClick={() => setSyncReport(null)} className="text-[#94a3b8] hover:text-[#1e293b]">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-[#64748b] mt-3">
              Synchronization completed at {format(new Date(syncReport.synced_at), 'h:mm:ss a, d MMM yyyy')}.
            </p>

            <div className="mt-4 space-y-2.5 max-h-60 overflow-y-auto">
              {syncReport.results.map((res) => (
                <div
                  key={res.platform_name}
                  className="p-3 rounded-xl bg-[#f8fafc] border border-[#eef2f6] flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-xs text-[#1e293b] block">
                      {getPlatformInfo(res.platform_name).title}
                    </span>
                    <span className="text-[10px] text-[#64748b] block mt-0.5">
                      {res.message || 'Complete'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        res.status === 'success'
                          ? 'bg-emerald-50 text-emerald-700'
                          : res.status === 'unavailable'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {res.status}
                    </span>
                    {res.status === 'success' && (
                      <span className="block text-[9px] text-[#94a3b8] mt-1">
                        +{res.items_added} new • {res.items_updated} updated
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-3 border-t border-[#f0f3f6] flex justify-end">
              <button
                onClick={() => setSyncReport(null)}
                className="px-5 py-2 bg-[#176d50] hover:bg-[#12583f] text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
