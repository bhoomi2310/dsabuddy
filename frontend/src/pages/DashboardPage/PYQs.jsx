import { useState, useRef, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  BRANCH_CODE_MAP,
  BRANCH_SHORT_NAMES,
} from "@/config/constants";
import {
  ArrowLeft,
  ExternalLink,
  Search,
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
  Plus,
  MessageSquare,
  Calendar,
  Send,
  X,
  ChevronUp,
  ChevronDown,
  ShieldAlert,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import apiClient from "@/api/client";
import { customCompanyDetails } from "../../data/company_details";
import Fuse from "fuse.js";
import { Card, Button, Input, Badge, CreateExperienceFullPage } from "@/components/common";
import { forumService } from "@/api/services/forumService";
import { useUserStore } from "@/store/useUserStore";
import { getErrorMessage } from "@/utils";

const sanitizeUrl = (url) => {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return '';
  }
  if (!/^(https?:)?\/\//i.test(trimmed) && !/^[./#]/i.test(trimmed)) {
    return '';
  }
  return trimmed;
};

const escapeAttr = (str) => {
  if (!str) return '';
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
};

const parseMarkdownToHTML = (text) => {
  if (!text) return '';
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  html = html.replace(/^### (.*?)$/gm, '<h3 class="text-white text-lg font-bold mt-4 mb-2 ">$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2 class="text-white text-xl font-bold mt-4 mb-2 ">$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1 class="text-white text-2xl font-bold mt-4 mb-2 ">$1</h1>');
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-[#0D1117] border border-[#1F2937] rounded-xl p-4 font-mono text-xs my-4 overflow-x-auto text-gray-300">$1</pre>');
  html = html.replace(/`([^`\n]+)`/g, '<code class="bg-[#0D1117] border border-[#1F2937] rounded px-1.5 py-0.5 font-mono text-xs text-[#FF453A]">$1</code>');
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, url) => {
    const safeUrl = sanitizeUrl(url);
    if (!safeUrl) return '[Invalid Image URL]';
    return `<div class="my-4 flex justify-center"><img src="${escapeAttr(safeUrl)}" alt="${escapeAttr(alt)}" class="max-w-full rounded-xl object-contain max-h-[400px] border border-[#1F2937] shadow-lg" /></div>`;
  });
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, (match, text, url) => {
    const safeUrl = sanitizeUrl(url);
    if (!safeUrl) return text;
    return `<a href="${escapeAttr(safeUrl)}" target="_blank" rel="noopener noreferrer" class="text-[#35b9f1] hover:underline">${text}</a>`;
  });
  html = html.replace(/\*\*([\s\S]*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([\s\S]*?)\*/g, '<em>$1</em>');
  html = html.replace(/_([\s\S]*?)_/g, '<em>$1</em>');
  html = html.replace(/^\s*[-*+]\s+(.*?)$/gm, '<li class="ml-4 list-disc text-gray-300 ">$1</li>');
  html = html.replace(/\n/g, '<br />');
  return html;
};

const buildCommentTree = (flatComments) => {
  if (!flatComments) return [];
  const map = {};
  const tree = [];
  flatComments.forEach(comment => {
    map[comment.id] = { ...comment, replies: [] };
  });
  flatComments.forEach(comment => {
    if (comment.parentId && map[comment.parentId]) {
      map[comment.parentId].replies.push(map[comment.id]);
    } else {
      tree.push(map[comment.id]);
    }
  });
  return tree;
};

function CommentNode({ comment, depth = 0, onAddReply, onDeleteComment, formatDate }) {
  const navigate = useNavigate();
  const loggedInUser = useUserStore((state) => state.user);
  const [replying, setReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    await onAddReply(comment.id, replyContent);
    setReplyContent('');
    setReplying(false);
  };

  const countAllReplies = (node) => {
    let count = 0;
    if (node.replies) {
      count += node.replies.length;
      node.replies.forEach(reply => {
        count += countAllReplies(reply);
      });
    }
    return count;
  };

  const totalReplies = countAllReplies(comment);

  return (
    <div 
      className="space-y-3 relative"
      style={{ marginLeft: depth > 0 ? '1.5rem' : '0px' }}
    >
      {depth > 0 && (
        <div className="absolute top-0 bottom-0 -left-3 w-0.5 bg-[#1F2937] pointer-events-none" />
      )}
      
      {collapsed ? (
        <div className="bg-[#0D1117]/30 border border-[#1F2937]/50 rounded-xl p-3 flex items-center justify-between hover:border-[#35b9f1]/10 transition-all duration-300">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              if (comment.author?.userName) navigate(`/profile/${comment.author.userName}`);
            }}
          >
            <img
              src={comment.author?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author?.name || 'Anonymous'}`}
              alt="avatar"
              className="w-6 h-6 rounded-lg bg-[#0D1117] border border-[#1F2937] p-0.5 opacity-50"
            />
            <div className="flex items-center gap-2">
              <span className="text-[#6B7280] font-bold text-xs">{comment.author?.name || 'Anonymous'}</span>
              <span className="text-[#4B5563] text-[9px] font-bold">
                {comment.author?.college || 'NSUT'} • {comment.author?.branch || 'N/A'}
              </span>
              <span className="text-[#4B5563] text-xs font-semibold">
                (Collapsed {totalReplies > 0 ? `• ${totalReplies} replies hidden` : ''})
              </span>
            </div>
          </div>
          <button
            onClick={() => setCollapsed(false)}
            className="text-[#35b9f1] hover:text-[#6fd3ff] text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer px-2.5 py-1 rounded-lg bg-[#1F2937]/30 hover:bg-[#1F2937]/50"
          >
            <ChevronDown className="w-3.5 h-3.5" />
            Expand
          </button>
        </div>
      ) : (
        <>
          <Card 
            variant="accent" 
            animated={false} 
            className="p-5 space-y-3 relative hover:border-[#35b9f1]/10 transition-all duration-300 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <div 
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                  if (comment.author?.userName) navigate(`/profile/${comment.author.userName}`);
                }}
              >
                <img
                  src={comment.author?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author?.name || 'Anonymous'}`}
                  alt="avatar"
                  className="w-8 h-8 rounded-lg bg-[#0D1117] border border-[#1F2937] p-0.5"
                />
                <div>
                  <span className="text-white font-bold text-sm block leading-none">{comment.author?.name || 'Anonymous'}</span>
                  <span className="text-[#6B7280] text-[10px] font-bold mt-1.5 block">
                    {comment.author?.college || 'NSUT'} • {comment.author?.branch || 'N/A'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#6B7280] text-[10px] font-mono font-bold">
                  {formatDate(comment.createdAt)}
                </span>
                <button
                  onClick={() => setCollapsed(true)}
                  className="text-[#6B7280] hover:text-[#35b9f1] p-1 rounded-lg hover:bg-[#1F2937] transition-all cursor-pointer"
                  title="Collapse thread"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <p className="text-[#9CA3AF] text-sm leading-relaxed font-medium pl-11">
              {comment.content}
            </p>

            {/* Reply Action Row */}
            <div className="pl-11 pt-1 flex items-center gap-4">
              <button
                onClick={() => setReplying(!replying)}
                className="text-[#35b9f1] hover:text-[#6fd3ff] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Reply
              </button>
              {(loggedInUser?.id === comment.author?.id || loggedInUser?.role === 'admin') && (
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this comment?")) {
                      onDeleteComment(comment.id);
                    }
                  }}
                  className="text-red-500 hover:text-red-400 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              )}
            </div>

            {/* Inline Reply Input */}
            {replying && (
              <form onSubmit={handleReplySubmit} className="pl-11 pt-2 flex gap-3 items-center">
                <Input
                  type="text"
                  placeholder={`Reply to ${comment.author?.name || 'Anonymous'}...`}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="flex-1"
                  inputClassName="py-2 text-xs border-[#1F2937]/30 bg-[#0D1117] rounded-lg"
                  autoFocus
                />
                <div className="flex gap-2 shrink-0">
                  <Button
                    type="button"
                    onClick={() => setReplying(false)}
                    variant="outline"
                    size="sm"
                    className="px-2.5 py-1.5 rounded-lg border-[#1F2937] text-xs font-bold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!replyContent.trim()}
                    variant="accent"
                    size="sm"
                    className="rounded-lg px-3 py-1.5 text-xs font-bold"
                  >
                    Submit
                  </Button>
                </div>
              </form>
            )}
          </Card>

          {/* Render nested replies recursively */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="space-y-4 pt-1">
              {comment.replies.map((reply) => (
                <CommentNode 
                  key={reply.id} 
                  comment={reply} 
                  depth={depth + 1} 
                  onAddReply={onAddReply} 
                  onDeleteComment={onDeleteComment}
                  formatDate={formatDate} 
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}



const normalizeName = (name) => {
  if (!name) return "";
  let norm = name
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(
      /\bjp\s*morgan\s*chase\b|\bjp\s*morgan\b|\bjpmc\b|\bj\.p\.\s*morgan\s*chase\b|\bj\.p\.\s*morgan\b/g,
      "jpmorganchase",
    )
    .replace(/\bibm\s*india\b|\bibm\b/g, "ibmindia")
    .replace(/\btexas\s*instruments?\b|\bti\b/g, "texasinstrument")
    .replace(/\bfast\s*retailing\s*\(japan\)|\bfast\s*retailing\b/g, "fastretailing")
    .replace(/\bgoogle\s*silicon\b/g, "googlesilicon")
    .replace(/\bde\s*shaw\s*&\s*co\b|\bde\s*shaw\b/g, "deshaw")
    .replace(/\bsamsung\s*bangalore\b|\bsamsung\s*delhi\b|\bsamsung\s*india\b|\bsamsung\b/g, "samsung")
    .replace(/\bbharat\s*petroleum\b/g, "bpcl")
    .replace(/\bnxp\s*semiconductors?\b/g, "nxpsemiconductor")
    .replace(/\bz\s*scal[ae]r\b/g, "zscaler")
    .replace(/\beil\s*psu\b|\beil\b/g, "eil")
    .replace(/\bhcl\s*tech\b|\bhcl\b/g, "hcl")
    .replace(/\bzs\s*associates?\b|\bzs\b/g, "zsassociate")
    .replace(/\bsiemens\s*eda\b|\bsiemens\b/g, "siemens")
    .replace(/\baccenture\s*interview\s*problems\s*all\b|\baccenture\b/g, "accenture")
    .replace(/[^a-z0-9]/g, "");
  return norm;
};

const companyLogos = {
  "Goldman Sachs": "Goldman Sachs Logo.png",
  LinkedIn: "LinkedIn.png",
  Adobe: "Adobe.png",
  "IBM India": "IBM.png",
  Atlassian: "Atlassian.png",
  Amazon: "Amazon.png",
  Cisco: "Cisco.png",
  "J.P. Morgan Chase": "JPMorganChase.png",
  Samsung: "Samsung.png",
  Expedia: "Expedia.png",
  Uber: "Uber.png",
  Google: "Google.png",
  Sprinklr: "Sprinklr.png",
  Autodesk: "Autodesk.png",
  Myntra: "Myntra.png",
  "Wells Fargo": "WellsFargo.png",
  MasterCard: "Mastercard.png",
  Optum: "Optum.png",
  "Texas Instrument": "TexasInstruments.png",
  NatWest: "Natwest.png",
  "Fast Retailing": "FastRetailing.png",
  MyKaarma: "MyKaarma.png",
  "AB InBev GCC": "ABInBev.png",
  Accenture: "Accenture.png",
  Accolite: "Accolite.png",
  "Adani Group": "AdaniGroup.png",
  Airtel: "Airtel.png",
  "Airtel Payment Bank": "AirtelPaymentBank.png",
  "Alvarez And Marsal": "AlvarezAndMarsal.png",
  Amdocs: "Amdocs.png",
  "Anand Group": "AnandGroup.png",
  Apple: "Apple.png",
  ARM: "ARM.png",
  ArmorCode: "ArmorCode.png",
  "Avant Garde": "AvantGarde.png",
  "Axis Bank": "AxisBank.png",
  "Bain & Company": "Bain&Company.png",
  "Bajaj Auto": "BajajAuto.png",
  BCG: "BCG.png",
  Bechtel: "Bechtel.png",
  Bharatpe: "BharatPe.png",
  BlackRock: "Blackrock.png",
  "BNP Paribas": "BNPParibas.png",
  BPCL: "BPCL.png",
  "Capital Power": "CapitalPower.png",
  ClearTax: "ClearTax.png",
  CoinSwitch: "CoinSwitch.png",
  Cvent: "Cvent.png",
  "DE Shaw": "D.EShaw&Co.png",
  "Deutsche Telekom": "DeutscheTelekom.png",
  DLF: "DLF.png",
  "DP World": "DPWorld.png",
  "DSP Mutual Fund": "DSPMutualFund.png",
  Dunnhumby: "DunnHumby.png",
  "Ebiz Solution": "EbizSolutions.png",
  "Eightfold AI": "EightFoldAI.png",
  EIL: "EIL.png",
  "Energy Infratech": "EnergyInfrastructure.png",
  Engineersmind: "EngineersMind.png",
  EY: "EY.png",
  Flipkart: "Flipkart.png",
  "Floor Daniel": "Fluor.png",
  "Future First": "FutureFirst.png",
  "GAIL PSU": "GailPSU.png",
  Gameskraft: "Gameskraft.png",
  "Ge Vernova": "GeVernova.png",
  GoDaddy: "GoDaddy.png",
  "GoodSpace AI": "GoodSpaceAI.png",
  "Google Silicon": "Google.png",
  "HCL Tech": "HCL.png",
  HeadLamp: "HeadLamp.png",
  Hike: "Hike.png",
  "Hindustan Power": "HindustanPower.png",
  Honda: "Honda.png",
  "HSBC Bank": "HSBC.png",
  IDEMITSU: "Idemitsu.png",
  Infoedge: "InfoEdge.png",
  Intuit: "Intuit.png",
  Kapstan: "Kapstan.png",
  Keysight: "Keysight.png",
  Kimbal: "Kimbal.png",
  KPMG: "KPMG.png",
  "Larsen And Toubro": "LarsenAndToubro.png",
  Macquarie: "Macquarie.png",
  magicpin: "MagicPin.png",
  MakeMyTrip: "MakeMyTrip.png",
  Mamaearth: "MamaEarth.png",
  MAQ: "MAQ.png",
  "Maruti Suzuki": "MarutiSuzuki.png",
  Mckinsey: "McKinsey&Company.png",
  "Media.net": "MediaNet.png",
  Meesho: "Meesho.png",
  Microsoft: "Microsoft.png",
  "Morgan Stanley": "MorganStanley.png",
  Motive: "Motive.png",
  NAB: "NAB.png",
  "Naik AI": "NaikAI.png",
  "NK Securities HFT": "NKSecurities.png",
  NMTRONICS: "NMTronics.png",
  Nvidia: "Nvidia.png",
  "NXP Semiconductors": "NXPSemiconductors.png",
  Nykaa: "Nykaa.png",
  Oracle: "Oracle.png",
  Oyo: "Oyo.png",
  "Paisa Bazar": "PaisaBazaar.png",
  PayPal: "PayPal.png",
  PharmEasy: "PharmEasy.png",
  PhonePe: "PhonePe.png",
  "Policy Bazar": "PolicyBazaar.png",
  Razorpay: "RazorPay.png",
  "Reliance Ltd": "Reliance.png",
  Rockman: "Rockman.png",
  Salesforce: "Salesforce.png",
  Samsara: "Samsara.png",
  Sedemac: "Sedemac.png",
  Shipsy: "Shipsy.png",
  "Siemens EDA": "Siemens.png",
  SiTime: "SiTime.png",
  Sunsire: "Sunrise.png",
  "Super AGI": "SuperAGI.png",
  Synopsys: "Synopsys.png",
  Syrma: "Syrma.png",
  TCIL: "TCIL.png",
  TCS: "TCS.png",
  "Tejas Network": "TejasNetwork.png",
  Thorogood: "Thorogood.png",
  "Times Internet": "TimesInternet.png",
  "Tower Research": "TowerResearch.png",
  Twilio: "Twilio.png",
  UKG: "UKG.png",
  UnivLabs: "UnivLabs.png",
  "Urban Company": "UrbanCompany.png",
  "Vecmocon Tech": "Vecmocon.png",
  Visa: "Visa.png",
  Voltas: "Voltas.png",
  Vyapar: "Vyapar.png",
  Wayfair: "Wayfair.png",
  WinZO: "Winzo.png",
  Wipro: "Wipro.png",
  WorkIndia: "WorkIndia.png",
  Zinnia: "Zinnia.png",
  Zomato: "Zomato.png",
  "Zs Associate": "Zs.png",
  Zscaler: "Zscaler.png",
  Zupee: "Zupee.png",
};

const getCompanyLogoUrl = (name, dbLogoUrl) => {
  if (dbLogoUrl) return dbLogoUrl;
  if (!name) return null;
  const normLookup = normalizeName(name);
  const matchingKey = Object.keys(companyLogos).find(
    (k) => normalizeName(k) === normLookup,
  );
  const filename = matchingKey ? companyLogos[matchingKey] : null;
  if (filename) {
    // Cloudinary replaces special characters like '&' and spaces with underscores
    const normalizedFilename = filename.replace(/[\s&]+/g, "_");
    return `https://res.cloudinary.com/dufgdskxu/image/upload/${encodeURIComponent(normalizedFilename)}`;
  }
  return null;
};

function CompanyCard({ company, onClick }) {
  const fallbackRef = useRef(null);
  const char = company.name.charAt(0).toUpperCase();
  const colors = [
    "bg-[#FF453A]",
    "bg-[#FF9F0A]",
    "bg-[#30D158]",
    "bg-[#0A84FF]",
    "bg-[#BF5AF2]",
    "bg-[#FF375F]",
  ];
  const colorIndex = company.name.charCodeAt(0) % colors.length;

  const logoUrl = company.logoUrl;

  return (
    <div
      onClick={onClick}
      className="bg-[#161B22] border border-[#1F2937] hover:border-[#35b9f1]/30 rounded-2xl p-6 flex flex-col items-center justify-between cursor-pointer transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl hover:shadow-[#0D1117]/80"
    >
      <div
        className={`w-20 h-20 rounded-xl border border-[#1F2937] flex items-center justify-center mb-4 transition-all ${
          logoUrl
            ? "bg-slate-100 p-2 group-hover:border-white/50"
            : "bg-[#0D1117]/80 group-hover:border-[#1F2937]/80"
        }`}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={company.name}
            onError={(e) => {
              console.error(`Failed to load company logo: ${logoUrl}`);
              e.target.style.display = "none";
              fallbackRef.current.style.display = "flex";
              e.target.parentNode.style.backgroundColor =
                "rgba(13, 17, 23, 0.8)";
              e.target.parentNode.style.padding = "0";
              e.target.parentNode.style.borderColor = "#1F2937";
            }}
            style={{
              width: 48,
              height: 48,
              objectFit: "contain",
              borderRadius: 8,
            }}
          />
        ) : null}
        <div
          ref={fallbackRef}
          style={{ display: logoUrl ? "none" : "flex" }}
          className={`w-12 h-12 ${colors[colorIndex]} rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg`}
        >
          {char}
        </div>
      </div>

      <h3 className="text-white font-bold text-lg mb-1 group-hover:text-[#35b9f1] transition-colors text-center w-full truncate">
        {company.name}
      </h3>

      <span className="text-xs bg-[#0D1117] text-[#9CA3AF] border border-[#1F2937] px-3 py-1 rounded-full font-mono font-bold mt-2">
        {company.questionCount} Questions
      </span>
    </div>
  );
}

function LogoImage({ name, logoUrl, size = "w-12 h-12 text-2xl" }) {
  const [error, setError] = useState(false);
  const classes = size.split(" ");
  const dimensionClasses = classes
    .filter(
      (c) =>
        c.startsWith("w-") || c.startsWith("h-") || c.startsWith("aspect-"),
    )
    .join(" ");
  const textClass = classes.find((c) => c.startsWith("text-")) || "text-2xl";

  if (error || !logoUrl) {
    const char = name.charAt(0).toUpperCase();
    const colors = [
      "bg-[#FF453A]",
      "bg-[#FF9F0A]",
      "bg-[#30D158]",
      "bg-[#0A84FF]",
      "bg-[#BF5AF2]",
      "bg-[#FF375F]",
    ];
    const colorIndex = name.charCodeAt(0) % colors.length;

    return (
      <div
        className={`${dimensionClasses} ${colors[colorIndex]} rounded-xl flex items-center justify-center text-white font-bold ${textClass} shadow-lg`}
      >
        {char}
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={`${name} Logo`}
      onError={(e) => {
        console.error(`Failed to load company logo: ${logoUrl}`);
        setError(true);
        if (e.target.parentNode) {
          e.target.parentNode.style.backgroundColor = "rgba(13, 17, 23, 0.9)";
          e.target.parentNode.style.padding = "0";
        }
      }}
      className={`${dimensionClasses} object-contain rounded-xl p-1.5 bg-slate-100`}
    />
  );
}

export function PYQs({ companies, onSelectQuestion }) {
  const { companyName } = useParams();
  const navigate = useNavigate();

  const getDisplayName = (rawName) => {
    const customDisplayNames = {
      apple: "Apple",
      "google silicon": "Google Silicon",
      "de shaw": "DE Shaw",
      zomato: "Zomato",
      "nk securities hft": "NK Securities HFT",
      meesho: "Meesho",
      "tower research": "Tower Research",
      hike: "Hike",
      intuit: "Intuit",
      "go daddy": "GoDaddy",
      "eightfold ai": "Eightfold AI",
      paypal: "PayPal",
      "phone pe": "PhonePe",
      "fast retailing japan": "Fast Retailing",
      visa: "Visa",
      gameskraft: "Gameskraft",
      nvidia: "Nvidia",
      vyapar: "Vyapar",
      salesforce: "Salesforce",
      "morgan stanley": "Morgan Stanley",
      "super agi": "Super AGI",
      samsara: "Samsara",
      razorpay: "Razorpay",
      "naik ai": "Naik AI",
      sitime: "SiTime",
      wayfair: "Wayfair",
      armorcode: "ArmorCode",
      "z scalar": "Zscaler",
      twilio: "Twilio",
      winzo: "WinZO",
      "siemens eda": "Siemens EDA",
      workindia: "WorkIndia",
      synopsys: "Synopsys",
      "nxp semiconductor": "NXP Semiconductors",
      "make my trip": "MakeMyTrip",
      "urban company": "Urban Company",
      blackrock: "BlackRock",
      ukg: "UKG",
      "media.net": "Media.net",
      shipsy: "Shipsy",
      cleartax: "ClearTax",
      arm: "ARM",
      coinswitch: "CoinSwitch",
      magicpin: "magicpin",
      kapstan: "Kapstan",
      "bharat petroleum": "BPCL",
      "dp world": "DP World",
      "eil psu": "EIL",
      zupee: "Zupee",
      "goodspace ai": "GoodSpace AI",
      sedemac: "Sedemac",
      pharmeasy: "PharmEasy",
      "bain and company": "Bain & Company",
      "dsp mutual fund": "DSP Mutual Fund",
    };
    const norm = rawName.toLowerCase().trim();
    if (customDisplayNames[norm]) return customDisplayNames[norm];
    return rawName
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  // Build combined companies map
  const combinedCompaniesMap = useMemo(() => {
    const map = {};
    if (companies && Array.isArray(companies)) {
      companies.forEach((c) => {
        const norm = normalizeName(c.name);

        const branchesSet = new Set();
        let minCgpa = null;
        if (c.placements && Array.isArray(c.placements)) {
          c.placements.forEach((p) => {
            if (p.eligibleBranches) {
              p.eligibleBranches.forEach((b) => branchesSet.add(b.toLowerCase()));
            }
            if (p.minCgpa !== undefined && p.minCgpa !== null) {
              if (minCgpa === null || p.minCgpa < minCgpa) {
                minCgpa = p.minCgpa;
              }
            }
          });
        }

        map[norm] = {
          name: c.name,
          questionCount: c.questionCount || 0,
          hasQuestions: (c.questionCount || 0) > 0,
          logoUrl: c.logoUrl || getCompanyLogoUrl(c.name),
          branches: Array.from(branchesSet),
          minCgpa,
        };
      });
    }
    return map;
  }, [companies]);

  const displayCompanies = useMemo(() => {
    return Object.values(combinedCompaniesMap)
      .filter((c) => c.questionCount > 0 || customCompanyDetails[normalizeName(c.name)] !== undefined)
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
      );
  }, [combinedCompaniesMap]);

  const [companySearchQuery, setCompanySearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [cgpaFilter, setCgpaFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");

  const [companyPage, setCompanyPage] = useState(1);
  const [questionPage, setQuestionPage] = useState(1);
  const companiesPerPage = 16;
  const questionsPerPage = 15;

  const getDbBranchCode = (value) => {
    if (!value || value === "all") return "all";
    
    // Normalize and clean string
    const val = value.toLowerCase().replace(/[()]/g, "").trim();

    // Check for CSE-related terms
    const csTerms = [
      "cs", "cse", "csai", "csda", "csds", "ciot",
      "computer science", "artificial intelligence",
      "big data", "data science", "internet of things"
    ];
    if (csTerms.some(t => val === t || val.includes(t))) return "cs";

    // Check for IT-related terms
    const itTerms = [
      "it", "itns", "information technology",
      "network and information security", "network security"
    ];
    if (itTerms.some(t => val === t || val.includes(t))) return "it";

    // Check for ECE-related terms
    const eceTerms = [
      "ece", "ecam", "evdt", "electronics",
      "vlsi"
    ];
    if (eceTerms.some(t => val === t || val.includes(t))) return "ece";

    // Check for ME-related terms
    const meTerms = [
      "me", "meev", "mechanical", "electric vehicle"
    ];
    if (meTerms.some(t => val === t || val.includes(t))) return "me";

    return val;
  };

  useEffect(() => {
    setCompanyPage(1);
  }, [companySearchQuery, branchFilter, cgpaFilter]);

  useEffect(() => {
    setQuestionPage(1);
  }, [searchQuery, difficultyFilter]);

  const searchedCompanies = useMemo(() => {
    let filtered = displayCompanies;

    if (branchFilter !== "all") {
      const targetCode = getDbBranchCode(branchFilter);
      filtered = filtered.filter((company) => {
        const branches = company.branches || [];
        if (branches.length === 0) {
          // If no specific placement data is available, assume typical tech eligibility (CS, IT, ECE, MAC)
          return ["cs", "it", "ece", "mac"].includes(targetCode);
        }
        return branches.includes("all") || branches.includes(targetCode);
      });
    }

    if (cgpaFilter !== "all") {
      const userCgpa = parseFloat(cgpaFilter);
      filtered = filtered.filter((company) => {
        if (company.minCgpa === undefined || company.minCgpa === null)
          return true; // No requirement specified
        return company.minCgpa <= userCgpa;
      });
    }

    if (!companySearchQuery) return filtered;

    const fuse = new Fuse(filtered, {
      keys: ["name"],
      threshold: 0.4,
    });
    return fuse.search(companySearchQuery).map((r) => r.item);
  }, [companySearchQuery, branchFilter, cgpaFilter, displayCompanies]);

  const getCompanyLogo = (name, size = "w-12 h-12 text-2xl") => {
    const norm = normalizeName(name);
    const companyObj = combinedCompaniesMap[norm];
    const logoUrl = companyObj?.logoUrl;
    return <LogoImage name={name} logoUrl={logoUrl} size={size} />;
  };

  // ── Route validation and data loading (placed at the top to satisfy Rules of Hooks) ────────────────
  const normSelected = companyName ? normalizeName(companyName) : "";
  const matchedCompany = companyName
    ? Object.values(combinedCompaniesMap).find(
        (c) => normalizeName(c.name) === normSelected,
      )
    : null;
  const selectedCompany = matchedCompany ? matchedCompany.name : "";

  const [questions, setQuestions] = useState([]);
  const [placementsInfo, setPlacementsInfo] = useState([]);
  const [metadata, setMetadata] = useState({
    eligibility_criteria: "Not specified",
    rounds_info: "Not specified",
    oa_platform: "Not specified",
    top_topics_and_questions: [],
    other_relevant_information: "",
  });
  const [loadingCompanyData, setLoadingCompanyData] = useState(false);

  useEffect(() => {
    if (!companyName || !normSelected) {
      setQuestions([]);
      setPlacementsInfo([]);
      setMetadata({
        eligibility_criteria: "Not specified",
        rounds_info: "Not specified",
        oa_platform: "Not specified",
        top_topics_and_questions: [],
        other_relevant_information: "",
      });
      return;
    }

    const fetchCompanyData = async () => {
      setLoadingCompanyData(true);
      try {
        const compRes = await apiClient.get(`/companies/${normSelected}`);
        if (compRes.company) {
          const c = compRes.company;
          setMetadata({
            eligibility_criteria: c.eligibilityCriteria || "Not specified",
            rounds_info: c.roundsInfo || "Not specified",
            oa_platform: c.oaPlatform || "Not specified",
            top_topics_and_questions: c.topTopics || [],
            other_relevant_information: c.otherInfo || "",
          });

          const mappedPlacements = (c.placements || []).map((p) => ({
            company: c.name,
            role: p.role,
            ctc_lpa: p.ctcLpa,
            stipend_month: p.stipendMonth,
            type: p.type,
            category: p.category,
            eligible_branches: p.eligibleBranches,
            min_cgpa: p.minCgpa,
          }));
          setPlacementsInfo(mappedPlacements);
        }

        const questionsRes = await apiClient.get(`/companies/${normSelected}/questions`);
        if (questionsRes.companyQuestions) {
          const mappedQuestions = questionsRes.companyQuestions.map((cq) => ({
            title: cq.question?.title || "",
            difficulty: cq.question?.difficulty || "MEDIUM",
            url: cq.question?.leetcodeUrl || "",
            frequency: cq.frequency || "OCCASIONAL",
            tags: cq.question?.tags?.map((t) => t.tag.name) || [],
          }));
          setQuestions(mappedQuestions);
        }
      } catch (err) {
        console.error("Failed to fetch company details:", err);
      } finally {
        setLoadingCompanyData(false);
      }
    };

    fetchCompanyData();
  }, [companyName, normSelected]);

  // ── Experiences Tab State and API Hooks ──────────────────────────────────
  const [experiences, setExperiences] = useState([]);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [loadingExperiences, setLoadingExperiences] = useState(false);
  const [experienceSearchQuery, setExperienceSearchQuery] = useState("");
  const [creatingExperience, setCreatingExperience] = useState(false);
  const loggedInUser = useUserStore((state) => state.user);

  // Form state for adding comments
  const [commentContent, setCommentContent] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Date formatter helper
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Load experiences for selected company
  const fetchExperiences = async () => {
    if (!selectedCompany) return;
    setLoadingExperiences(true);
    try {
      // Query the API using company name as search filter
      const data = await forumService.getPosts({ search: selectedCompany });
      setExperiences(data.posts || []);
    } catch (err) {
      console.error("Failed to fetch experiences:", err);
    } finally {
      setLoadingExperiences(false);
    }
  };

  useEffect(() => {
    if (activeTab === "experiences" && selectedCompany) {
      fetchExperiences();
      setSelectedExperience(null);
    }
  }, [activeTab, selectedCompany]);

  // Load details of a specific experience
  const fetchExperienceDetail = async (id) => {
    setLoadingExperiences(true);
    try {
      const data = await forumService.getPost(id);
      setSelectedExperience(data.post);
    } catch (err) {
      console.error("Failed to fetch experience details:", err);
    } finally {
      setLoadingExperiences(false);
    }
  };

  // Upvote / Downvote experience post
  const handleVote = async (e, postId, value) => {
    e.stopPropagation();
    try {
      const data = await forumService.votePost(postId, value);
      
      // Update details view state if open
      if (selectedExperience && selectedExperience.id === postId) {
        setSelectedExperience(prev => ({
          ...prev,
          userVote: data.userVote,
          score: data.score,
          upvoteCount: data.score,
          isUpvoted: data.userVote === 1,
        }));
      }

      // Update list view state
      setExperiences(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            userVote: data.userVote,
            score: data.score,
            upvoteCount: data.score,
            isUpvoted: data.userVote === 1,
          };
        }
        return p;
      }));
    } catch (err) {
      console.error("Failed to vote:", err);
    }
  };

  // Add top-level comment or nested reply
  const handleAddCommentOrReply = async (parentId, content) => {
    if (!selectedExperience) return;
    try {
      const data = await forumService.addComment(selectedExperience.id, {
        content,
        parentId,
      });

      setSelectedExperience(prev => ({
        ...prev,
        comments: [...(prev.comments || []), data.comment],
      }));

      // Update comment count in list view
      setExperiences(prev => prev.map(p => {
        if (p.id === selectedExperience.id) {
          return {
            ...p,
            commentCount: (p.commentCount || 0) + 1,
          };
        }
        return p;
      }));
    } catch (err) {
      console.error("Failed to add comment/reply:", err);
    }
  };

  const handleAddTopComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim() || !selectedExperience) return;
    
    try {
      setSubmittingComment(true);
      await handleAddCommentOrReply(null, commentContent);
      setCommentContent("");
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await forumService.deletePost(postId);
      setExperiences(prev => prev.filter(p => p.id !== postId));
      setSelectedExperience(null);
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!selectedExperience) return;
    try {
      await forumService.deleteComment(commentId);
      
      const getDescendantIds = (cId, allComments) => {
        const directChildren = allComments.filter(c => c.parentId === cId);
        let ids = [cId];
        for (const child of directChildren) {
          ids = [...ids, ...getDescendantIds(child.id, allComments)];
        }
        return ids;
      };

      const descendantIds = getDescendantIds(commentId, selectedExperience.comments || []);
      const countDeleted = descendantIds.length;

      setSelectedExperience(prev => ({
        ...prev,
        comments: (prev.comments || []).filter(c => !descendantIds.includes(c.id)),
      }));

      setExperiences(prev => prev.map(p => {
        if (p.id === selectedExperience.id) {
          return {
            ...p,
            commentCount: Math.max(0, (p.commentCount || 0) - countDeleted),
          };
        }
        return p;
      }));
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  // ── Publish experience (called by full-page editor) ───────────────────────
  const publishExperience = async ({ title, content, tags }) => {
    const finalTags = Array.isArray(tags) ? [...tags] : [];
    if (!finalTags.includes(selectedCompany)) finalTags.push(selectedCompany);
    const data = await forumService.createPost({ title, content, tags: finalTags });
    setExperiences(prev => [data.post, ...prev]);
    setSelectedExperience(data.post);
    setCreatingExperience(false);
  };

  // ── Detect HTML vs markdown content for rendering ────────────────────
  const handleCarouselImageUpload = async (e) => {
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'));
    e.target.value = '';
    for (const file of files) {
      const uploadData = new FormData();
      uploadData.append('file', file);
      try {
        setUploadingImage(true);
        const res = await apiClient.post('/upload/upload', uploadData, { headers: { 'Content-Type': 'multipart/form-data' } });
        const url = res?.url || res?.data?.url;
        if (url) setUploadedImages(prev => [...prev, { url, name: file.name }]);
        else setPostError("Failed to upload image — no URL returned.");
      } catch (err) {
        setPostError("Failed to upload image. Please try again.");
      } finally {
        setUploadingImage(false);
      }
    }
  };

  // Insert carousel images directly into the editor body
  const insertImagesIntoEditor = () => {
    if (!editorRef.current || uploadedImages.length === 0) return;
    editorRef.current.focus();
    uploadedImages.forEach(img => {
      const imgEl = document.createElement('img');
      imgEl.src = img.url;
      imgEl.alt = img.name;
      imgEl.style.cssText = 'max-width:100%;border-radius:8px;margin:8px 0;display:block;';
      editorRef.current.appendChild(imgEl);
      editorRef.current.appendChild(document.createElement('br'));
    });
  };

  // Upload and immediately insert an image at the cursor in the editor
  const handleInlineImageUpload = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const uploadData = new FormData();
    uploadData.append('file', file);
    try {
      setUploadingImage(true);
      setPostError("");
      const res = await apiClient.post('/upload/upload', uploadData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = res?.url || res?.data?.url;
      if (url && editorRef.current) {
        editorRef.current.focus();
        const imgEl = document.createElement('img');
        imgEl.src = url;
        imgEl.alt = file.name;
        imgEl.style.cssText = 'max-width:100%;border-radius:8px;margin:8px 0;display:block;';
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          range.insertNode(imgEl);
          range.collapse(false);
        } else {
          editorRef.current.appendChild(imgEl);
        }
      } else if (!url) {
        setPostError("Failed to upload image. No URL returned.");
      }
    } catch (err) {
      setPostError("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Detect if content is HTML (from WYSIWYG) or raw markdown
  const renderPostContent = (content) => {
    if (!content) return '';
    if (/<[a-z][\s\S]*>/i.test(content)) return content;
    return parseMarkdownToHTML(content);
  };

  // Open create modal with fresh state
  const openCreateModal = () => {
    setPostTitle("");
    setPostTagsList(selectedCompany ? [selectedCompany] : []);
    setTagInputText("");
    setPostError("");
    setUploadedImages([]);
    setActiveImageIndex(0);
    setShowCreateModal(true);
  };

  // Create new experience post
  const handleCreateExperience = async () => {
    const content = editorRef.current?.innerHTML?.trim() || '';
    if (!postTitle.trim()) {
      setPostError("Title is required.");
      return;
    }
    try {
      setSubmittingPost(true);
      setPostError("");
      const finalTags = [...postTagsList];
      if (!finalTags.includes(selectedCompany)) finalTags.push(selectedCompany);
      const data = await forumService.createPost({ title: postTitle, content, tags: finalTags });
      setExperiences(prev => [data.post, ...prev]);
      setSelectedExperience(data.post);
      setPostTitle("");
      setPostTagsList([]);
      setTagInputText("");
      setUploadedImages([]);
      setActiveImageIndex(0);
      if (editorRef.current) editorRef.current.innerHTML = '';
      setShowCreateModal(false);
    } catch (err) {
      console.error("Failed to create experience:", err);
      setPostError("Failed to publish experience. Please try again.");
    } finally {
      setSubmittingPost(false);
    }
  };

  // Build comment tree hierarchy for detailed view
  const commentTree = useMemo(() => {
    if (!selectedExperience || !selectedExperience.comments) return [];
    return buildCommentTree(selectedExperience.comments);
  }, [selectedExperience]);

  // Filter experiences locally using search input
  const filteredExperiences = useMemo(() => {
    if (!experienceSearchQuery) return experiences;
    const query = experienceSearchQuery.toLowerCase();
    return experiences.filter(exp => 
      exp.title?.toLowerCase().includes(query) || 
      exp.content?.toLowerCase().includes(query) ||
      exp.author?.name?.toLowerCase().includes(query)
    );
  }, [experiences, experienceSearchQuery]);

  const getPlacementsStats = () => {
    if (placementsInfo.length === 0) return null;
    const roles = Array.from(
      new Set(placementsInfo.map((p) => p.role).filter(Boolean)),
    );
    const maxCtc = Math.max(
      ...placementsInfo
        .map((p) => p.ctc_lpa)
        .filter((n) => typeof n === "number"),
      0,
    );
    const stipend = Math.max(
      ...placementsInfo
        .map((p) => p.stipend_month)
        .filter((n) => typeof n === "number"),
      0,
    );
    const branches = Array.from(
      new Set(
        placementsInfo
          .flatMap((p) => p.eligible_branches || [])
          .filter(Boolean),
      ),
    );
    const minCgpa = Math.min(
      ...placementsInfo
        .map((p) => p.min_cgpa)
        .filter((n) => typeof n === "number"),
      10,
    );
    return {
      roles,
      maxCtc: maxCtc > 0 ? maxCtc : null,
      stipend: stipend > 0 ? stipend : null,
      branches,
      minCgpa: minCgpa !== 10 ? minCgpa : null,
    };
  };

  const placementStats = getPlacementsStats();

  const formatBranches = (branches) => {
    if (!branches || branches.length === 0) return "Not specified";
    if (branches.includes("all")) return "All branches";
    return branches
      .map((b) => {
        const name = b.trim().toLowerCase();
        return BRANCH_SHORT_NAMES[name] || name.toUpperCase();
      })
      .join("/");
  };

  const lookupKey = selectedCompany
    ? selectedCompany.toLowerCase().replace(/[^a-z0-9]/g, "")
    : "";
  const custom = selectedCompany ? customCompanyDetails[lookupKey] || {} : {};

  // ── Eligibility data ────────────────────────────────────────────────────────
  const getDetailedEligibility = () => {
    const base = custom.detailedEligibility || {
      degrees: "B.Tech / M.Tech / Dual Degree",
      branches: "CSE, IT, ECE, EE, ICE, and related branches",
      criteria:
        metadata.eligibility_criteria &&
        metadata.eligibility_criteria !== "Not specified"
          ? `Minimum ${metadata.eligibility_criteria} or equivalent.`
          : "Minimum 7.5 CGPA or equivalent.",
      backlogs: "Strictly no active backlogs allowed.",
    };
    if (placementStats) {
      if (placementStats.minCgpa)
        base.criteria = `Minimum ${placementStats.minCgpa} CGPA or equivalent.`;
      if (placementStats.branches && placementStats.branches.length > 0)
        base.branches = formatBranches(placementStats.branches);
    }
    return base;
  };

  const eligibility = getDetailedEligibility();

  // ── Stats grid data ─────────────────────────────────────────────────────────
  const getCgpaDisplay = () => {
    if (placementStats?.minCgpa) return `${placementStats.minCgpa}+`;
    const crit = eligibility.criteria || "";
    const m = crit.match(/(\d+(\.\d+)?)/);
    return m ? `${m[1]}+` : "N/A";
  };

  const getRoundsDisplay = () => {
    if (custom.timeline && custom.timeline.length > 0)
      return custom.timeline.length;
    if (metadata.rounds && metadata.rounds.length > 0)
      return metadata.rounds.length;
    return "—";
  };

  const getPlatformDisplay = () => {
    if (metadata.oa_platform && metadata.oa_platform !== "Not specified")
      return metadata.oa_platform;
    return "HackerRank";
  };

  const getBranchesDisplay = () => {
    if (placementStats?.branches?.length > 0)
      return formatBranches(placementStats.branches);
    const b = eligibility.branches || "";
    const shorts = b.match(/[A-Z]{2,4}(?:\/[A-Z]{2,4})*/g);
    return shorts ? shorts.join("/") : "CS/IT/ECE";
  };

  const getDegreeDisplay = () => {
    const deg = eligibility.degrees || "B.Tech/IDD";
    const parts = deg.split("/").map((d) => d.trim().replace(/\s+/g, "."));
    return parts.slice(0, 2).join("/");
  };

  // ── Popular Topics ──────────────────────────────────────────────────────────
  const getPopularTopics = () => {
    if (
      metadata.top_topics_and_questions &&
      metadata.top_topics_and_questions.length > 0
    ) {
      return metadata.top_topics_and_questions.slice(0, 5).map((t) => {
        const words = t.split(" ");
        return words.length > 2 ? words.slice(0, 2).join(" ") : t;
      });
    }
    return ["DP", "Graphs", "Trees", "Strings"];
  };

  const popularTopics = getPopularTopics();

  // Initialize Fuse for problems (unconditional hook)
  const fuseProblems = useMemo(() => {
    return new Fuse(questions, {
      keys: ["title", "tags"],
      threshold: 0.4,
    });
  }, [questions]);

  // ── Questions filtering (unconditional hook) ─────────────────────────────────
  const filteredQuestions = useMemo(() => {
    let result = questions;
    if (searchQuery.trim()) {
      result = fuseProblems.search(searchQuery).map((r) => r.item);
    }
    if (difficultyFilter !== "all") {
      result = result.filter(
        (q) => q.difficulty?.toLowerCase() === difficultyFilter.toLowerCase(),
      );
    }
    return result;
  }, [searchQuery, difficultyFilter, questions, fuseProblems]);

  const paginatedCompanies = useMemo(() => {
    const startIndex = (companyPage - 1) * companiesPerPage;
    return searchedCompanies.slice(startIndex, startIndex + companiesPerPage);
  }, [searchedCompanies, companyPage, companiesPerPage]);

  const totalCompanyPages =
    Math.ceil(searchedCompanies.length / companiesPerPage) || 1;

  const paginatedQuestions = useMemo(() => {
    const startIndex = (questionPage - 1) * questionsPerPage;
    return filteredQuestions.slice(startIndex, startIndex + questionsPerPage);
  }, [filteredQuestions, questionPage, questionsPerPage]);

  const totalQuestionPages =
    Math.ceil(filteredQuestions.length / questionsPerPage) || 1;

  // ── Directory landing view (conditional rendering moved here, AFTER all hooks) ─────────────────
  if (!companyName) {
    return (
      <div className="space-y-8 pb-16">
        <div>
          <h1 className="text-white text-4xl font-normal italic mb-2 font-serif">
            Company Placement Archives
          </h1>
          <p className="text-[#9CA3AF] text-sm font-medium">
            Explore recruitment pipelines, eligibility criteria, and past year
            interview questions for top tech employers.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Search companies (e.g., Goldman Sachs, JPMorgan, Apple...)"
                value={companySearchQuery}
                onChange={(e) => setCompanySearchQuery(e.target.value)}
                className="w-full bg-[#161B22] border border-[#1F2937] rounded-xl pl-11 pr-4 py-2.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-[#35b9f1]/40 focus:ring-1 focus:ring-[#35b9f1]/40 transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer font-mono uppercase ${
                showFilters || branchFilter !== "all" || cgpaFilter !== "all"
                  ? "bg-[#35b9f1]/10 border-[#35b9f1] text-[#35b9f1]"
                  : "bg-[#161B22] border-[#1F2937] text-neutral-400 hover:text-neutral-200 hover:border-neutral-800"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {(branchFilter !== "all" || cgpaFilter !== "all") && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#35b9f1] shadow-[0_0_8px_#35b9f1]" />
              )}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-[#161B22]/50 border border-[#1F2937] rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-5 transition-all duration-200">
              {/* Branch Selector */}
              <div>
                <label className="block text-[10px] text-neutral-400 font-bold uppercase mb-2 font-mono tracking-wider">
                  Eligible Branch
                </label>
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="w-full bg-[#0D1117] border border-[#1F2937] text-xs text-neutral-200 rounded-lg p-2.5 focus:outline-none focus:border-[#35b9f1]/40 focus:ring-1 focus:ring-[#35b9f1]/40 transition-all cursor-pointer"
                >
                  <option value="all">ALL BRANCHES</option>
                  {Object.entries(BRANCH_CODE_MAP).map(([name, code]) => (
                    <option key={code} value={code}>
                      {name} ({code})
                    </option>
                  ))}
                </select>
              </div>

              {/* CGPA Selector */}
              <div>
                <label className="block text-[10px] text-neutral-400 font-bold uppercase mb-2 font-mono tracking-wider">
                  Max CGPA Required (Your CGPA)
                </label>
                <select
                  value={cgpaFilter}
                  onChange={(e) => setCgpaFilter(e.target.value)}
                  className="w-full bg-[#0D1117] border border-[#1F2937] text-xs text-neutral-200 rounded-lg p-2.5 focus:outline-none focus:border-[#35b9f1]/40 focus:ring-1 focus:ring-[#35b9f1]/40 transition-all cursor-pointer"
                >
                  <option value="all">ANY CGPA</option>
                  {["9.5", "9.0", "8.5", "8.0", "7.5", "7.0", "6.5", "6.0"].map(
                    (cgpa) => (
                      <option key={cgpa} value={cgpa}>
                        {cgpa} or below
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>
          )}

          {/* Records Status Bar */}
          {(branchFilter !== "all" ||
            cgpaFilter !== "all" ||
            companySearchQuery) && (
            <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono bg-neutral-950/20 border border-neutral-900/60 px-4 py-2 rounded-lg">
              <span>
                Found{" "}
                <strong className="text-neutral-300 font-bold">
                  {searchedCompanies.length}
                </strong>{" "}
                matching{" "}
                {searchedCompanies.length === 1 ? "company" : "companies"}
              </span>
              <button
                onClick={() => {
                  setBranchFilter("all");
                  setCgpaFilter("all");
                  setCompanySearchQuery("");
                }}
                className="text-[#35b9f1] hover:underline cursor-pointer font-bold uppercase text-[10px] tracking-wider"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {searchedCompanies.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {paginatedCompanies.map((company) => (
                <CompanyCard
                  key={company.name}
                  company={company}
                  onClick={() => navigate(`/dashboard/pyqs/${company.name}`)}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalCompanyPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-900 pt-6 font-mono text-xs">
                <span className="text-neutral-500">
                  Showing{" "}
                  {Math.min(
                    searchedCompanies.length,
                    (companyPage - 1) * companiesPerPage + 1,
                  )}
                  -
                  {Math.min(
                    searchedCompanies.length,
                    companyPage * companiesPerPage,
                  )}{" "}
                  of {searchedCompanies.length} companies
                </span>
                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  <button
                    disabled={companyPage === 1}
                    onClick={() =>
                      setCompanyPage((prev) => Math.max(prev - 1, 1))
                    }
                    className="p-2 border border-neutral-900 bg-neutral-950/20 text-neutral-400 rounded-lg hover:border-neutral-800 disabled:opacity-30 disabled:hover:border-neutral-900 cursor-pointer disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {(() => {
                    const pages = [];
                    const maxVisible = 5;
                    let start = Math.max(1, companyPage - 2);
                    let end = Math.min(
                      totalCompanyPages,
                      start + maxVisible - 1,
                    );
                    if (end - start + 1 < maxVisible) {
                      start = Math.max(1, end - maxVisible + 1);
                    }

                    if (start > 1) {
                      pages.push(
                        <button
                          key={1}
                          onClick={() => setCompanyPage(1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-900 hover:border-neutral-800 text-neutral-400 transition-all cursor-pointer"
                        >
                          1
                        </button>,
                      );
                      if (start > 2) {
                        pages.push(
                          <span
                            key="dots-start"
                            className="px-1 text-neutral-600"
                          >
                            ...
                          </span>,
                        );
                      }
                    }

                    for (let i = start; i <= end; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => setCompanyPage(i)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all cursor-pointer ${
                            companyPage === i
                              ? "bg-[#35b9f1]/10 border-[#35b9f1] text-[#35b9f1] font-bold"
                              : "border-neutral-900 hover:border-neutral-800 text-neutral-400"
                          }`}
                        >
                          {i}
                        </button>,
                      );
                    }

                    if (end < totalCompanyPages) {
                      if (end < totalCompanyPages - 1) {
                        pages.push(
                          <span
                            key="dots-end"
                            className="px-1 text-neutral-600"
                          >
                            ...
                          </span>,
                        );
                      }
                      pages.push(
                        <button
                          key={totalCompanyPages}
                          onClick={() => setCompanyPage(totalCompanyPages)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-900 hover:border-neutral-800 text-neutral-400 transition-all cursor-pointer"
                        >
                          {totalCompanyPages}
                        </button>,
                      );
                    }
                    return pages;
                  })()}

                  <button
                    disabled={companyPage === totalCompanyPages}
                    onClick={() =>
                      setCompanyPage((prev) =>
                        Math.min(prev + 1, totalCompanyPages),
                      )
                    }
                    className="p-2 border border-neutral-900 bg-neutral-950/20 text-neutral-400 rounded-lg hover:border-neutral-800 disabled:opacity-30 disabled:hover:border-neutral-900 cursor-pointer disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#161B22]/30 rounded-2xl border border-dashed border-[#1F2937] transition-all">
            <p className="text-neutral-400 font-mono text-sm">
              No companies found matching{" "}
              {companySearchQuery
                ? `"${companySearchQuery}"`
                : "selected criteria"}
              {branchFilter !== "all"
                ? ` for branch ${branchFilter === "mac" ? "M&C" : branchFilter.toUpperCase()}`
                : ""}
              {cgpaFilter !== "all"
                ? ` with CGPA requirement <= ${cgpaFilter}`
                : ""}
            </p>
          </div>
        )}
      </div>
    );
  }

  // ── Route validation (conditional rendering moved here, AFTER all hooks) ────────────────────
  if (companyName && !matchedCompany) {
    return (
      <div className="text-center py-16 bg-[#161B22]/30 rounded-2xl border border-dashed border-[#1F2937]">
        <p className="text-white text-lg font-bold">
          Company "{companyName}" not found in our archives.
        </p>
        <button
          onClick={() => navigate("/dashboard/pyqs")}
          className="mt-4 bg-[#35b9f1] hover:bg-[#35b9f1]/80 text-[#0D1117] px-4 py-2 rounded-xl font-bold transition-all"
        >
          Back to Archives
        </button>
      </div>
    );
  }

  // ── Difficulty badge styles ─────────────────────────────────────────────────
  const getDifficultyBadge = (diff) => {
    const d = diff?.toLowerCase();
    if (d === "easy")
      return { cls: "border-[#30D158] text-[#30D158]", label: "EASY" };
    if (d === "medium")
      return { cls: "border-[#FF9F0A] text-[#FF9F0A]", label: "MEDIUM" };
    if (d === "hard")
      return { cls: "border-[#FF453A] text-[#FF453A]", label: "HARD" };
    return { cls: "border-[#6B7280] text-[#6B7280]", label: "EASY" };
  };

  // Show timeline from custom.timeline (rich data) or fall back to metadata.rounds (PDF-extracted)
  const hasTimeline =
    (custom.timeline && custom.timeline.length > 0) ||
    (metadata.rounds && metadata.rounds.length > 0);
  const timelineSteps =
    custom.timeline && custom.timeline.length > 0
      ? custom.timeline
      : (metadata.rounds || []).map((r, i) => ({
          step: i + 1,
          title: r.roundName,
          desc: r.details,
        }));

  const initials = selectedCompany
    ? selectedCompany
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "";

  // ── RENDER ──────────────────────────────────────────────────────────────────
  if (loadingCompanyData) {
    return (
      <div className="min-h-screen bg-[#000000] text-[#E5E7EB] flex flex-col items-center justify-center font-mono text-xs text-neutral-500">
        <div className="w-8 h-8 border-2 border-neutral-800 border-t-[#35b9f1] rounded-full animate-spin mb-4" />
        Loading company details...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#E5E7EB] pb-20">
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 text-xs tracking-wider uppercase text-neutral-500 mb-6 font-mono">
        <button
          onClick={() => navigate("/dashboard/pyqs")}
          className="hover:text-[#35b9f1] transition-colors cursor-pointer"
        >
          Company Mines
        </button>
        <ChevronRight className="w-3 h-3 text-neutral-600" />
        <span className="text-[#35b9f1] font-semibold">
          {selectedCompany.toUpperCase()}
        </span>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex items-center gap-0 border-b border-neutral-900 mb-8 font-mono">
        {[
          { id: "overview", label: "Overview" },
          { id: "problems", label: `Problems (${questions.length})` },
          { id: "experiences", label: "Experiences" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setDifficultyFilter("all");
              setSearchQuery("");
            }}
            className={`px-6 py-3.5 text-xs tracking-widest uppercase transition-all duration-200 cursor-pointer border-b-2 font-bold ${
              activeTab === tab.id
                ? "text-[#35b9f1] border-[#35b9f1]"
                : "text-neutral-500 border-transparent hover:text-neutral-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          OVERVIEW TAB
      ══════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Left / Main ── */}
          <div className="flex-1 min-w-0">
            {/* Company header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center flex-shrink-0 text-black font-extrabold text-base select-none shadow-md overflow-hidden">
                {matchedCompany?.logoUrl ? (
                  <LogoImage
                    name={selectedCompany}
                    logoUrl={matchedCompany.logoUrl}
                    size="w-36 h-36 text-base"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] tracking-widest uppercase text-neutral-500 font-mono">
                  Company Profile
                </span>
                <h1 className="text-4xl sm:text-5xl text-white font-normal italic mt-0.5 leading-none font-serif">
                  {selectedCompany}
                </h1>
              </div>
            </div>

            {/* Stats grid */}
            <div className="border border-neutral-900 rounded-xl mb-8 bg-neutral-950/20 font-mono">
              <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-y md:divide-y-0 divide-neutral-900">
                {[
                  { label: "CGPA MIN *", value: getCgpaDisplay() },
                  { label: "ROUNDS", value: getRoundsDisplay() },
                  { label: "PLATFORM", value: getPlatformDisplay() },
                  { label: "BRANCHES", value: getBranchesDisplay() },
                  { label: "DEGREE", value: getDegreeDisplay() },
                ].map((stat, i) => (
                  <div key={i} className="px-5 py-5 text-center md:text-left">
                    <p className="text-[10px] tracking-widest uppercase text-neutral-500 mb-2">
                      {stat.label}
                    </p>
                    <p
                      className={`text-sm font-semibold tracking-wide ${
                        i === 0 ? "text-[#35b9f1]" : "text-neutral-200"
                      }`}
                    >
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Interview Process — only if custom timeline exists */}
            {hasTimeline && (
              <div className="mt-12">
                <p className="text-xs tracking-widest uppercase text-neutral-500 mb-8 font-bold font-mono">
                  Interview Process
                </p>
                <div className="relative border-l border-neutral-800 ml-3 pl-8 space-y-8">
                  {timelineSteps.map((step, idx) => {
                    const stepLabel = idx === 0 ? "OA" : `R${idx}`;
                    const isFirst = idx === 0;
                    return (
                      <div key={idx} className="relative group">
                        {/* Dot indicator on the left line */}
                        <div
                          className={`absolute -left-[37px] top-1.5 w-2 h-2 rounded-full border transition-all duration-300 ${
                            isFirst
                              ? "bg-[#35b9f1] border-[#35b9f1] shadow-[0_0_8px_#35b9f1]"
                              : "bg-neutral-900 border-neutral-700"
                          }`}
                        />

                        {/* Content */}
                        <div>
                          <p className="text-sm tracking-wide mb-2 text-neutral-200 font-mono font-semibold">
                            <span
                              className={
                                isFirst ? "text-[#35b9f1]" : "text-neutral-400"
                              }
                            >
                              {stepLabel}
                            </span>
                            <span className="text-neutral-600 mx-2">—</span>
                            <span className="text-neutral-100">
                              {step.title}
                            </span>
                          </p>
                          <p className="text-neutral-400 text-sm leading-relaxed max-w-xl">
                            {step.desc}
                          </p>
                          {step.tags && (
                            <div className="flex gap-2 mt-3 flex-wrap">
                              {step.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] tracking-wider uppercase border border-neutral-800 bg-neutral-900/10 text-neutral-400 px-2 py-0.5 rounded font-mono"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Right Sidebar ── */}
          <div className="w-full lg:w-64 flex-shrink-0 space-y-4 font-mono">
            {/* Eligibility */}
            <div className="border border-neutral-900 bg-neutral-950/10 rounded-xl p-5">
              <p className="text-xs tracking-wider uppercase text-neutral-500 mb-4 font-bold">
                Eligibility
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400">CGPA</span>
                  <span className="text-[#35b9f1] text-xs font-bold">
                    {getCgpaDisplay()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400">Backlogs</span>
                  <span className="text-[#FF453A] text-xs font-bold tracking-wider uppercase">
                    NONE
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-xs text-neutral-400 whitespace-nowrap">
                    Branches
                  </span>
                  <span className="text-neutral-200 text-xs font-bold tracking-wider uppercase text-right break-words">
                    {placementStats?.branches?.length > 0 &&
                    placementStats.branches.includes("all")
                      ? "ALL OPEN"
                      : eligibility.branches?.includes("all")
                        ? "ALL OPEN"
                        : getBranchesDisplay()}
                  </span>
                </div>
              </div>
            </div>

            {/* NSUT Placement History */}
            {placementStats && (
              <div className="border border-neutral-900 bg-neutral-950/10 rounded-xl p-5">
                <p className="text-xs tracking-wider uppercase text-neutral-500 mb-4 font-bold">
                  Placements
                </p>
                {placementStats.maxCtc && (
                  <div className="mb-4">
                    <span className="text-xs text-neutral-400 block mb-1">
                      Max CTC *:
                    </span>
                    <span className="text-[#35b9f1] font-normal italic text-2xl font-serif">
                      {placementStats.maxCtc} LPA
                    </span>
                  </div>
                )}
                {placementStats.stipend && (
                  <div className="mb-4">
                    <span className="text-xs text-neutral-400 block mb-1">
                      Max Stipend:
                    </span>
                    <span className="text-emerald-400 text-sm font-bold">
                      ₹{placementStats.stipend.toLocaleString()}/mo
                    </span>
                  </div>
                )}
                {placementStats.roles?.length > 0 && (
                  <div>
                    <span className="text-xs text-neutral-400 block mb-1">
                      Target Roles:
                    </span>
                    <span className="text-neutral-200 text-xs">
                      {placementStats.roles.slice(0, 2).join(", ")}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Popular Topics */}
            {popularTopics.length > 0 && (
              <div className="border border-neutral-900 bg-neutral-950/10 rounded-xl p-5">
                <p className="text-xs tracking-wider uppercase text-neutral-500 mb-4 font-bold">
                  Popular Topics
                </p>
                <div className="flex flex-wrap gap-2">
                  {popularTopics.map((topic, i) => (
                    <span
                      key={i}
                      className="text-xs border border-neutral-900 bg-neutral-950/30 text-neutral-400 px-2.5 py-1 rounded"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer Footnote */}
            <div className="border border-neutral-900/60 bg-neutral-950/5 rounded-xl p-5">
              <p className="text-[10px] text-neutral-500 leading-relaxed">
                * Note: CGPA requirements and CTC stats are based on historical
                placement history and are subject to change for upcoming
                recruiting seasons.
              </p>
            </div>

            {/* CTA */}
            {questions.length > 0 && (
              <button
                onClick={() => setActiveTab("problems")}
                className="w-full bg-[#35b9f1] hover:bg-[#35b9f1]/90 text-black text-xs tracking-wider uppercase font-extrabold py-3.5 px-4 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 font-mono"
              >
                <span>View {questions.length} Tagged Problems</span>
                <ChevronRight className="w-4 h-4 text-black" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          PROBLEMS TAB
      ══════════════════════════════════════════ */}
      {activeTab === "problems" && (
        <div className="font-mono">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-neutral-900 pb-6">
            <div>
              {/* Company hero name on problems tab */}
              <h1 className="text-4xl sm:text-5xl font-normal italic text-white mb-2 font-serif">
                {selectedCompany}
              </h1>
              <p className="text-neutral-400 text-sm tracking-wide">
                {custom.subTitle || "Software Engineering Opportunities"}
              </p>
            </div>
            {placementStats?.maxCtc && (
              <div className="text-left md:text-right">
                <span className="text-xs text-neutral-500 block mb-1 font-mono">
                  MAX CTC *
                </span>
                <span className="text-[#35b9f1] font-normal italic text-3xl font-serif">
                  {placementStats.maxCtc} LPA
                </span>
              </div>
            )}
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-2 flex-wrap mb-6">
            {["all", "easy", "medium", "hard"].map((f) => (
              <button
                key={f}
                onClick={() => setDifficultyFilter(f)}
                className={`text-xs tracking-wider uppercase px-4 py-2 rounded-lg border transition-all duration-150 cursor-pointer ${
                  difficultyFilter === f
                    ? f === "all"
                      ? "bg-[#35b9f1] text-black border-[#35b9f1] font-bold"
                      : f === "easy"
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold"
                        : f === "medium"
                          ? "bg-amber-500/10 border-amber-500 text-amber-400 font-bold"
                          : "bg-red-500/10 border-red-500 text-red-400 font-bold"
                    : "border-neutral-900 text-neutral-500 hover:border-neutral-800 hover:text-neutral-300"
                }`}
              >
                {f}
              </button>
            ))}

            {/* Search bar */}
            <div className="ml-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
              <input
                type="text"
                placeholder="Search problems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-neutral-950 border border-neutral-900 rounded-lg pl-9 pr-4 py-2 text-xs text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-[#35b9f1]/40 transition-all w-48"
              />
            </div>
          </div>

          {/* Questions table */}
          <div className="border border-neutral-900 rounded-xl overflow-hidden bg-neutral-950/20">
            {/* Table header */}
            <div className="grid grid-cols-[4rem_1fr_8rem_5rem] border-b border-neutral-900 bg-neutral-950/60 font-bold">
              <div className="px-5 py-4 text-xs tracking-wider uppercase text-neutral-500">
                IDX
              </div>
              <div className="px-5 py-4 text-xs tracking-wider uppercase text-neutral-500">
                Problem
              </div>
              <div className="px-5 py-4 text-xs tracking-wider uppercase text-neutral-500 text-center">
                Difficulty
              </div>
              <div className="px-5 py-4 text-xs tracking-wider uppercase text-neutral-500 text-center">
                Action
              </div>
            </div>

            {/* Rows */}
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-neutral-500 text-xs tracking-wider uppercase">
                  No problems match current filters
                </p>
              </div>
            ) : (
              paginatedQuestions.map((question, index) => {
                const badge = getDifficultyBadge(question.difficulty);
                const actualIndex =
                  (questionPage - 1) * questionsPerPage + index + 1;
                return (
                  <div
                    key={index}
                    onClick={() =>
                      question.url &&
                      window.open(question.url, "_blank", "noopener,noreferrer")
                    }
                    className={`grid grid-cols-[4rem_1fr_8rem_5rem] border-b border-neutral-900 last:border-0 hover:bg-neutral-950/40 transition-colors duration-100 ${question.url ? "cursor-pointer" : ""} group`}
                  >
                    {/* Index */}
                    <div className="px-5 py-5 flex items-center">
                      <span className="text-neutral-500 text-xs font-bold font-mono">
                        {String(actualIndex).padStart(2, "0")}
                      </span>
                    </div>
                    {/* Problem */}
                    <div className="px-5 py-5">
                      <p className="text-neutral-200 text-sm font-semibold group-hover:text-[#35b9f1] transition-colors leading-snug mb-2">
                        {question.title}
                      </p>
                      {question.tags && question.tags.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {question.tags.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] tracking-wider uppercase border border-neutral-900 bg-neutral-950/40 text-neutral-500 px-2 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Difficulty */}
                    <div className="px-5 py-5 flex items-center justify-center">
                      <span
                        className={`text-[10px] font-bold tracking-widest uppercase border px-2.5 py-1 rounded ${badge.cls}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                    {/* Action */}
                    <div className="px-5 py-5 flex items-center justify-center">
                      {question.url && (
                        <ExternalLink className="w-4 h-4 text-neutral-600 group-hover:text-[#35b9f1] transition-colors" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination Controls */}
          {totalQuestionPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-900 pt-6 mt-6 font-mono text-xs">
              <span className="text-neutral-500">
                Showing{" "}
                {Math.min(
                  filteredQuestions.length,
                  (questionPage - 1) * questionsPerPage + 1,
                )}
                -
                {Math.min(
                  filteredQuestions.length,
                  questionPage * questionsPerPage,
                )}{" "}
                of {filteredQuestions.length} problems
              </span>
              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                <button
                  disabled={questionPage === 1}
                  onClick={() =>
                    setQuestionPage((prev) => Math.max(prev - 1, 1))
                  }
                  className="p-2 border border-neutral-900 bg-neutral-950/20 text-neutral-400 rounded-lg hover:border-neutral-800 disabled:opacity-30 disabled:hover:border-neutral-900 cursor-pointer disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {(() => {
                  const pages = [];
                  const maxVisible = 5;
                  let start = Math.max(1, questionPage - 2);
                  let end = Math.min(
                    totalQuestionPages,
                    start + maxVisible - 1,
                  );
                  if (end - start + 1 < maxVisible) {
                    start = Math.max(1, end - maxVisible + 1);
                  }

                  if (start > 1) {
                    pages.push(
                      <button
                        key={1}
                        onClick={() => setQuestionPage(1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-900 hover:border-neutral-800 text-neutral-400 transition-all cursor-pointer"
                      >
                        1
                      </button>,
                    );
                    if (start > 2) {
                      pages.push(
                        <span
                          key="dots-start"
                          className="px-1 text-neutral-600"
                        >
                          ...
                        </span>,
                      );
                    }
                  }

                  for (let i = start; i <= end; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => setQuestionPage(i)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all cursor-pointer ${
                          questionPage === i
                            ? "bg-[#35b9f1]/10 border-[#35b9f1] text-[#35b9f1] font-bold"
                            : "border-neutral-900 hover:border-neutral-800 text-neutral-400"
                        }`}
                      >
                        {i}
                      </button>,
                    );
                  }

                  if (end < totalQuestionPages) {
                    if (end < totalQuestionPages - 1) {
                      pages.push(
                        <span key="dots-end" className="px-1 text-neutral-600">
                          ...
                        </span>,
                      );
                    }
                    pages.push(
                      <button
                        key={totalQuestionPages}
                        onClick={() => setQuestionPage(totalQuestionPages)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-900 hover:border-neutral-800 text-neutral-400 transition-all cursor-pointer"
                      >
                        {totalQuestionPages}
                      </button>,
                    );
                  }
                  return pages;
                })()}

                <button
                  disabled={questionPage === totalQuestionPages}
                  onClick={() =>
                    setQuestionPage((prev) =>
                      Math.min(prev + 1, totalQuestionPages),
                    )
                  }
                  className="p-2 border border-neutral-900 bg-neutral-950/20 text-neutral-400 rounded-lg hover:border-neutral-800 disabled:opacity-30 disabled:hover:border-neutral-900 cursor-pointer disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {filteredQuestions.length > 0 && totalQuestionPages <= 1 && (
            <p className="text-neutral-600 text-xs tracking-wider uppercase text-center mt-6">
              Showing all {filteredQuestions.length} problems
            </p>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          EXPERIENCES TAB
      ══════════════════════════════════════════ */}
      {activeTab === "experiences" && (
        <div className="space-y-6">
          {creatingExperience ? (
            <CreateExperienceFullPage
              company={selectedCompany}
              onPublish={publishExperience}
              onCancel={() => setCreatingExperience(false)}
            />
          ) : selectedExperience ? (
            // ─── Detailed Experience View ───
            <div className="space-y-6 animate-fadeIn">
              <Button
                onClick={() => setSelectedExperience(null)}
                variant="outline"
                size="sm"
                className="rounded-xl border-neutral-900 text-neutral-400 hover:text-white flex items-center gap-2 cursor-pointer font-mono uppercase tracking-widest text-[10px]"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Experiences
              </Button>

              <Card variant="default" animated={false} className="rounded-2xl p-6 md:p-8 space-y-6 border-neutral-900 bg-neutral-950/20">
                {/* Header info */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-900 pb-6">
                  <div 
                    className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-all"
                    onClick={() => {
                      if (selectedExperience.author?.userName) navigate(`/profile/${selectedExperience.author.userName}`);
                    }}
                  >
                    <img
                      src={selectedExperience.author?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedExperience.author?.name || 'Anonymous'}`}
                      alt="avatar"
                      className="w-12 h-12 rounded-xl bg-neutral-950 border border-neutral-900 p-0.5"
                    />
                    <div>
                      <h4 className="text-white font-extrabold text-base leading-snug">
                        {selectedExperience.author?.name || 'Anonymous'}
                      </h4>
                      <p className="text-neutral-500 text-xs font-semibold mt-1">
                        {selectedExperience.author?.college || 'NSUT'} • {selectedExperience.author?.branch || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-neutral-500 text-xs font-semibold font-mono">
                      <Calendar className="w-4 h-4" />
                      {formatDate(selectedExperience.createdAt)}
                    </div>
                    {(loggedInUser?.id === selectedExperience.author?.id || loggedInUser?.role === 'admin') && (
                      <button
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this experience post? This will delete all comments and cannot be undone.")) {
                            handleDeletePost(selectedExperience.id);
                          }
                        }}
                        className="text-red-500 hover:text-red-400 p-2 rounded-xl bg-neutral-950 border border-neutral-900/60 hover:bg-neutral-900 hover:border-neutral-800 transition-all cursor-pointer flex items-center gap-1.5 font-bold text-xs"
                        title="Delete Experience"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {/* Title & Tags */}
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
                    {selectedExperience.title}
                  </h1>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedExperience.tags?.map((tag) => (
                      <Badge
                        key={tag}
                        className="bg-neutral-950 text-[#35b9f1] border border-neutral-900 font-bold text-xs px-2.5 py-0.5 rounded-lg"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Post Content */}
                <div 
                  className="wysiwyg-content text-[#E5E7EB] text-base leading-relaxed font-medium border-b border-neutral-900 pb-6"
                  dangerouslySetInnerHTML={{ __html: renderPostContent(selectedExperience.content) }}
                />

                {/* Voting & Footer info */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-neutral-950 border border-neutral-900 rounded-xl p-1 gap-1">
                    <button
                      onClick={(e) => handleVote(e, selectedExperience.id, 1)}
                      className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${
                        selectedExperience.userVote === 1
                          ? 'text-[#35b9f1] bg-[#35b9f1]/10'
                          : 'text-neutral-500 hover:text-white hover:bg-neutral-900'
                      }`}
                      title="Upvote"
                    >
                      <ChevronUp className="w-5 h-5" />
                    </button>
                    
                    <span className={`px-2 font-mono font-bold text-sm min-w-[20px] text-center ${
                      selectedExperience.userVote === 1
                        ? 'text-[#35b9f1]'
                        : selectedExperience.userVote === -1
                        ? 'text-red-500'
                        : 'text-[#E5E7EB]'
                    }`}>
                      {selectedExperience.score || 0}
                    </span>

                    <button
                      onClick={(e) => handleVote(e, selectedExperience.id, -1)}
                      className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${
                        selectedExperience.userVote === -1
                          ? 'text-red-500 bg-red-500/10'
                          : 'text-neutral-500 hover:text-white hover:bg-neutral-900'
                      }`}
                      title="Downvote"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 text-neutral-500 text-sm font-semibold font-mono pl-2">
                    <MessageSquare className="w-4 h-4" />
                    {selectedExperience.comments?.length || 0} Comments
                  </div>
                </div>

                {/* Comments Area */}
                <div className="space-y-6 pt-6 border-t border-neutral-900">
                  <h3 className="text-lg font-extrabold text-white">Comments</h3>
                  
                  {/* Comment submission form */}
                  <form onSubmit={handleAddTopComment} className="flex gap-4">
                    <textarea
                      placeholder="Share your thoughts or ask a question..."
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      className="flex-1 min-h-[48px] max-h-[160px] bg-neutral-950 border border-neutral-900 rounded-xl px-4 py-3 text-sm text-[#E5E7EB] placeholder-neutral-600 focus:outline-none focus:border-[#35b9f1]/30 transition-all"
                      rows={2}
                    />
                    <Button
                      type="submit"
                      disabled={submittingComment || !commentContent.trim()}
                      className="bg-[#35b9f1] hover:bg-[#10a3e0] text-[#0D1117] font-extrabold rounded-xl px-5 flex items-center justify-center cursor-pointer transition-all self-end h-[48px]"
                    >
                      {submittingComment ? 'Posting...' : <Send className="w-4 h-4" />}
                    </Button>
                  </form>

                  {/* Comments list */}
                  <div className="space-y-6 pt-2">
                    {commentTree && commentTree.length > 0 ? (
                      commentTree.map((comment) => (
                        <CommentNode 
                          key={comment.id} 
                          comment={comment} 
                          onAddReply={handleAddCommentOrReply}
                          onDeleteComment={handleDeleteComment}
                          formatDate={formatDate}
                        />
                      ))
                    ) : (
                      <div className="text-center py-10 bg-neutral-950/20 border border-dashed border-neutral-900 rounded-xl">
                        <p className="text-neutral-600 font-mono text-xs">No comments yet. Be the first to comment!</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            // ─── Experiences List View ───
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <Input
                  type="text"
                  placeholder="Search experiences..."
                  value={experienceSearchQuery}
                  onChange={(e) => setExperienceSearchQuery(e.target.value)}
                  icon={Search}
                  className="w-full md:w-80"
                  inputClassName="py-2.5 bg-neutral-950 border-neutral-900 rounded-xl placeholder-neutral-600 text-white"
                />
                
                <Button
                  onClick={() => setCreatingExperience(true)}
                  className="bg-[#35b9f1] hover:bg-[#10a3e0] text-[#0D1117] font-extrabold rounded-xl px-5 py-3 flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0"
                >
                  <Plus className="w-5 h-5" />
                  Share Experience
                </Button>
              </div>

              {loadingExperiences ? (
                <div className="text-center py-20 font-mono text-neutral-500 uppercase tracking-widest text-xs">
                  Loading Experiences...
                </div>
              ) : filteredExperiences.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredExperiences.map((post) => (
                    <Card
                      key={post.id}
                      variant="default"
                      onClick={() => fetchExperienceDetail(post.id)}
                      className="p-6 flex flex-col justify-between cursor-pointer hover:border-[#35b9f1]/20 rounded-2xl w-full h-auto bg-neutral-950/20 border-neutral-900"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div 
                            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-all"
                            onClick={(e) => {
                              if (post.author?.userName) {
                                e.stopPropagation();
                                navigate(`/profile/${post.author.userName}`);
                              }
                            }}
                          >
                            <img
                              src={post.author?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.name || 'Anonymous'}`}
                              alt="avatar"
                              className="w-9 h-9 rounded-lg bg-neutral-950 border border-neutral-900 p-0.5"
                            />
                            <div>
                              <span className="text-white font-bold text-sm block leading-none">
                                {post.author?.name || 'Anonymous'}
                              </span>
                              <span className="text-neutral-500 text-[10px] font-bold mt-1 block">
                                {post.author?.college || 'NSUT'} • {post.author?.branch || 'N/A'}
                              </span>
                            </div>
                          </div>
                          <span className="text-neutral-600 text-[10px] font-mono">
                            {formatDate(post.createdAt)}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-white font-bold text-base leading-snug hover:text-[#35b9f1] transition-all">
                            {post.title}
                          </h3>
                          <p className="text-neutral-400 text-xs leading-relaxed line-clamp-3 font-medium">
                            {post.content?.replace(/<[^>]*>/g, '').replace(/[#*`_[\]()]/g, '').slice(0, 200)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-neutral-900/60 pt-4 mt-5">
                        <div className="flex items-center gap-1.5 bg-neutral-950/50 border border-neutral-900 rounded-lg py-1 px-2">
                          <button
                            onClick={(e) => handleVote(e, post.id, 1)}
                            className={`p-0.5 rounded transition-all duration-200 cursor-pointer ${
                              post.userVote === 1 ? 'text-[#35b9f1]' : 'text-neutral-500 hover:text-white'
                            }`}
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <span className="text-xs font-mono font-bold text-neutral-300 min-w-[12px] text-center">
                            {post.score || 0}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-neutral-500 font-mono text-xs">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {post.commentCount || 0}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 border border-dashed border-neutral-900 rounded-2xl bg-neutral-950/5 font-mono">
                  <div className="w-16 h-16 border border-neutral-900 rounded-xl flex items-center justify-center mx-auto mb-6 bg-neutral-950/10">
                    <MessageSquare className="w-6 h-6 text-neutral-600" />
                  </div>
                  <p className="text-neutral-500 text-xs tracking-widest uppercase mb-2">
                    No Experiences
                  </p>
                  <p className="text-neutral-600 text-sm mb-6">
                    Interview experiences for {selectedCompany} will appear here.
                  </p>
                  <Button
                    onClick={() => setCreatingExperience(true)}
                    className="bg-[#35b9f1] hover:bg-[#10a3e0] text-[#0D1117] font-extrabold rounded-xl px-5 py-2.5 text-xs cursor-pointer shadow-lg transition-all"
                  >
                    Share your experience
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
