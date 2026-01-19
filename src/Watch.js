import React, { useEffect, useRef, useMemo, useState } from 'react';
import './Home.css';
import axios from 'axios';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import Plyr from 'plyr';

function Watch() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  /* ===================== PARAMS ===================== */
  const animeId = searchParams.get('animeId');
  const initialEpisodeHref = searchParams.get('episodeHref');

  /* ===================== STATE ===================== */
  const [episodeHref, setEpisodeHref] = useState(initialEpisodeHref);
  const [videoSrc, setVideoSrc] = useState('');
  const [loading, setLoading] = useState(false);

  const [animeData, setAnimeData] = useState(null);
  const [animeEpisodes, setAnimeEpisodes] = useState([]);

  const [search, setSearch] = useState('');
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const [genre, setGenre] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');


  /* ===================== REFS ===================== */
  const playerContainerRef = useRef(null);
  const searchRef = useRef(null);
  const plyrInstance = useRef(null);

  /* ===================== SEARCH ===================== */
  const handleSearch = async (value) => {
    setSearch(value);
    if (!value.trim()) {
      setShowResults(false);
      return;
    }

    try {
      const { data } = await axios.get(
        'https://televisions-replacement-gsm-promising.trycloudflare.com/search',
        { params: { q: value } }
      );
      setResults(data?.animeList || []);
      setShowResults(true);
    } catch {
      setShowResults(false);
    }
  };

  useEffect(() => {
    const close = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  /* ===================== FETCH ANIME INFO ===================== */
  useEffect(() => {
    if (!animeId) return;

    axios
      .get('https://televisions-replacement-gsm-promising.trycloudflare.com/getAnimeInfo', {
        params: { animeId },
      })
      .then((res) => setAnimeData(res.data.animeInfo))
      .catch(console.error);
  }, [animeId]);

  /* ===================== FETCH EPISODES ===================== */
  useEffect(() => {
    if (!episodeHref) return;

    axios
      .get(
        'https://televisions-replacement-gsm-promising.trycloudflare.com/getAnimeEpisodesInfo',
        { params: { episodeHref } }
      )
      .then((res) => setAnimeEpisodes(res.data.animeList || []))
      .catch(console.error);
  }, [episodeHref]);

  /* ===================== VIDEO SOURCE ===================== */
  const changeSource = async (href) => {
    setLoading(true);
    try {
      const res = await axios.get(
        'https://televisions-replacement-gsm-promising.trycloudflare.com/getEpisodeSource',
        { params: { episodeHref: href } }
      );
      setVideoSrc(res.data.episodeSrc);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (episodeHref) changeSource(episodeHref);
  }, [episodeHref]);

  /* ===================== PLYR ===================== */
  useEffect(() => {
    if (!videoSrc || !playerContainerRef.current) return;

    playerContainerRef.current.innerHTML = '';

    const video = document.createElement('video');
    video.src = videoSrc;
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;
    video.style.width = '100%';
    video.style.maxHeight = '80vh';

    playerContainerRef.current.appendChild(video);

    plyrInstance.current = new Plyr(video, {
      controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
    });

    return () => {
      plyrInstance.current?.destroy();
      plyrInstance.current = null;
    };
  }, [videoSrc]);

  /* ===================== FILTER ===================== */
  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/?genre=${genre}&type=${type}&status=${status}`);
  };

  const handleLetter = (l) => navigate(`/?letter=${l}`);

  /* ===================== EPISODE BROWSER ===================== */
  const EpisodeBrowser = ({ episodes }) => {
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [selectedRangeKey, setSelectedRangeKey] = useState(null);

  const grouped = useMemo(() => {
    const g = {};
    episodes.forEach((ep, index) => {
      const start = Math.floor(index / 100) * 100 + 1;
      const end = Math.min(start + 99, episodes.length);
      const key = `${start}–${end}`;
      g[key] ??= [];
      g[key].push({ ep, index });
    });
    return g;
  }, [episodes]);

  const keys = useMemo(() => Object.keys(grouped), [grouped]);

  useEffect(() => {
    if (!selectedRangeKey && keys.length) {
      const lastKey = keys[keys.length - 1];
      setSelectedRangeKey(lastKey);
      setSelectedEpisode(grouped[lastKey][0].index);
    }
  }, [keys, grouped, selectedRangeKey]);

  return (
    <div id="epo">
      {keys.map((k) => (
        <span
          key={k}
          onClick={() => setSelectedRangeKey(k)}
          style={{
            margin: 6,
            padding: '6px 10px',
            cursor: 'pointer',
            background: selectedRangeKey === k ? '#5a2e98' : '#eee',
            color: selectedRangeKey === k ? '#fff' : '#000',
            borderRadius: 4,
          }}
        >
          {k}
        </span>
      ))}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {grouped[selectedRangeKey]?.map(({ ep, index }) => (
          <button
            key={index}
            onClick={() => {
              setEpisodeHref(ep.episodeHref);
              setSelectedEpisode(index);
            }}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};


  /* ===================== JSX ===================== */
  return (
    <div>
      {loading && <div className="spinner" />}

      <header>
        <Link to="/" className="logo">11Anime</Link>

        <div ref={searchRef} className="searchBox">
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="أدخل اسم الأنمي"
          />
          {showResults && (
            <div id="ress">
              {results?.map((r) => (
                <Link
                  key={r.animeId}
                  to={`/watch?animeId=${r.animeId}&episodeHref=https://anime3rb.com/episode/${r.animeId}/1`}
                >
                  {r.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      <h1>{animeData?.title}</h1>

      <div ref={playerContainerRef} />

      <EpisodeBrowser episodes={animeEpisodes} />

      <form onSubmit={handleSubmit}>
        <select value={genre} onChange={(e) => setGenre(e.target.value)}>
          <option value="">All</option>
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option>
        </select>
        <button>Filter</button>
      </form>

      <footer>
        {['#','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']
          .map(l => (
            <span key={l} onClick={() => handleLetter(l)}>{l}</span>
          ))}
      </footer>
    </div>
  );
}

export default Watch;
