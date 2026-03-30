import { useNavigate } from 'react-router-dom';
import { useAuhtStore } from '../../stores';
import heroImg from '../../assets/fire-suppression-hero.png';

const stats = [
  { label: 'Protección Activa', value: '24/7', icon: '🔥' },
  { label: 'Proyectos Gestionados', value: 'CRM', icon: '📊' },
  { label: 'Mantenimientos', value: 'Agenda', icon: '📅' },
  { label: 'Equipo Técnico', value: 'Grupos', icon: '👷' },
];

const quickLinks = [
  {
    title: 'Tareas & Grupos',
    description: 'Gestiona las tareas del equipo y los grupos de trabajo',
    icon: '✅',
    route: '/tasks',
    color: '#0a84ff',
    permission: 'ADMIN',
  },
  {
    title: 'Agenda Mantenimientos',
    description: 'Programa y visualiza los mantenimientos preventivos',
    icon: '📅',
    route: '/agenda-mantenimientos',
    color: '#30d158',
    permission: 'ADMIN',
  },
  {
    title: 'Comercial / Compras',
    description: 'Seguimiento de órdenes de compra y cotizaciones',
    icon: '🛒',
    route: '/purchasing-manager',
    color: '#ff9f0a',
    permission: 'PURCHASE',
  },
  {
    title: 'Formatos',
    description: 'Accede y gestiona los formatos técnicos y documentos',
    icon: '📄',
    route: '/formats',
    color: '#bf5af2',
    permission: null,
  },
];

export const HomePage = () => {
  const navigate = useNavigate();
  const currentUser = useAuhtStore((state) => state.user);

  const hasPermission = (permission: string | null) => {
    if (!permission) return true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return currentUser?.permissions.includes(permission as any) ||
           // eslint-disable-next-line @typescript-eslint/no-explicit-any
           currentUser?.permissions.includes('ADMIN' as any);
  };

  const visibleLinks = quickLinks.filter((l) => hasPermission(l.permission));

  return (
    <div style={{
      width: '100%',
      minHeight: 'calc(100vh - 50px)',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: 'white',
      overflowX: 'hidden',
    }}>

      {/* ── Hero Section ── */}
      <div style={{
        position: 'relative',
        width: '100%',
        minHeight: '360px',
        borderRadius: '20px',
        overflow: 'hidden',
        marginBottom: '32px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Background image */}
        <img
          src={heroImg}
          alt="Sistema de redes contra incendios"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top',
          }}
        />
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(10,10,20,0.85) 0%, rgba(20,30,60,0.6) 50%, rgba(200,40,40,0.3) 100%)',
        }} />

        {/* Content */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          padding: '48px 40px',
          maxWidth: '600px',
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,69,58,0.2)',
            border: '1px solid rgba(255,69,58,0.4)',
            borderRadius: '100px',
            padding: '4px 14px',
            marginBottom: '20px',
            backdropFilter: 'blur(10px)',
          }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#ff6b6b', letterSpacing: '1px' }}>
              🔥 FAST FIRE DE COLOMBIA
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
            fontWeight: 900,
            margin: '0 0 12px 0',
            lineHeight: 1.1,
            letterSpacing: '-1px',
            textShadow: '0 2px 20px rgba(0,0,0,0.5)',
          }}>
            CRM de Gestión<br />
            <span style={{
              background: 'linear-gradient(90deg, #ff6b35, #ff453a)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Contra Incendios
            </span>
          </h1>

          <p style={{
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.75)',
            margin: '0 0 28px 0',
            lineHeight: 1.6,
            maxWidth: '440px',
          }}>
            Plataforma integral para la gestión de proyectos, mantenimientos preventivos,
            cotizaciones y equipos técnicos en sistemas de protección contra incendios.
          </p>

          {currentUser && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '12px',
              padding: '12px 16px',
              width: 'fit-content',
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff6b35, #ff453a)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '14px',
              }}>
                {currentUser.firstName?.charAt(0)}{currentUser.lastName?.charAt(0)}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>
                  {currentUser.firstName} {currentUser.lastName}
                </p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                  {currentUser.permissions.includes('ADMIN') ? '⚡ Administrador' : '👤 Usuario'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {stats.map((stat) => (
          <div key={stat.label} style={{
            background: 'rgba(10,10,20,0.65)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center',
            transition: 'border-color 0.2s, transform 0.2s',
          }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,69,58,0.4)';
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.08)';
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
            }}
          >
            <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>{stat.icon}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ff6b35' }}>{stat.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px', fontWeight: 500 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Quick Access ── */}
      <div style={{ marginBottom: '12px' }}>
        <h2 style={{
          fontSize: '1.1rem',
          fontWeight: 700,
          color: 'rgba(255,255,255,0.9)',
          margin: '0 0 16px 0',
          letterSpacing: '-0.3px',
        }}>
          Acceso Rápido
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '16px',
        }}>
          {visibleLinks.map((link) => (
            <button
              key={link.route}
              onClick={() => navigate(link.route)}
              style={{
                background: 'rgba(10,10,20,0.65)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: `1px solid rgba(255,255,255,0.1)`,
                borderRadius: '16px',
                padding: '20px',
                textAlign: 'left',
                cursor: 'pointer',
                color: 'white',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = `rgba(${link.color === '#0a84ff' ? '10,132,255' : link.color === '#30d158' ? '48,209,88' : link.color === '#ff9f0a' ? '255,159,10' : '191,90,242'},0.12)`;
                (e.currentTarget as HTMLButtonElement).style.borderColor = link.color;
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 12px 30px rgba(0,0,0,0.3)`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{
                  fontSize: '1.5rem',
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: `${link.color}22`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${link.color}44`,
                }}>
                  {link.icon}
                </div>
                <span style={{ color: link.color, fontSize: '1.2rem' }}>→</span>
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontWeight: 700, fontSize: '0.95rem' }}>{link.title}</p>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{link.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Footer text ── */}
      <div style={{
        marginTop: '32px',
        padding: '14px 20px',
        borderRadius: '12px',
        background: 'rgba(10,10,20,0.65)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        textAlign: 'center',
      }}>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>
          Fast Fire de Colombia · Sistema de Gestión Interna · v2.0
        </p>
      </div>

    </div>
  );
};
