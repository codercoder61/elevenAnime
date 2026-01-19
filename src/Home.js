import React, { useRef, useState, useEffect } from 'react';
import './Home.css';
import axios from 'axios';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  const slideshow = useRef(null);
  const ress = useRef(null);
  const ti = useRef(null);
  const refs = useRef([]);

  /* ===================== SEARCH ===================== */
  const [search, setSearch] = useState('');
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async (value) => {
    if (!value.trim()) {
      setResults(null);
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
      if (ress.current && !ress.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  /* ===================== SLIDESHOW ===================== */
  let slideIndex = 1;

  

  const showSlides = useCallback((n) => {
  const slides = document.getElementsByClassName('mySlides');
    if (!slides.length) return;
    if (n > slides.length) slideIndex = 1;
    if (n < 1) slideIndex = slides.length;
    Array.from(slides).forEach((s) => (s.style.display = 'none'));
    slides[slideIndex - 1].style.display = 'block';
}, []);

  useEffect(() => {
  showSlides(slideIndex);
}, [slideIndex, showSlides]);

  /* ===================== DATA ===================== */
  const [recUpd, setRecUpd] = useState([]);
  const [loading2, setLoading2] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = recUpd.slice(indexOfFirstItem, indexOfLastItem);

  const [searchParams] = useSearchParams();
  const letter = searchParams.get('letter');

  useEffect(() => {
    const fetchLatest = async () => {
      setLoading2(true);
      try {
        const res = await axios.get(
          'https://televisions-replacement-gsm-promising.trycloudflare.com/getLatestAnimes'
        );
        setRecUpd(res.data.animeList || []);
      } finally {
        setLoading2(false);
      }
    };

    if (letter) handleLetter(letter);
    else fetchLatest();
  }, [letter]);

  /* ===================== FILTER ===================== */
  

 

  /* ===================== LETTER FILTER ===================== */
  const handleLetter = async (l) => {
    setLoading2(true);
    setCurrentPage(1);
    ti.current.textContent = l ? `${l} الحرف` : 'الكل';
    document.getElementById('ancre')?.scrollIntoView({ behavior: 'smooth' });

    try {
      const res = await axios.get(
        'https://televisions-replacement-gsm-promising.trycloudflare.com/search',
        { params: { q: l } }
      );
      setRecUpd(res.data?.animeList || []);
    } finally {
      setLoading2(false);
    }
  };

  /* ===================== TOOLTIP ===================== */
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [animeState, setAnimeState] = useState('');
  
  const [genres, setGenres] = useState([]);

  const handleMouseEnter = async (animeId, index) => {
    const rect = refs.current[index].getBoundingClientRect();
    setTooltipPos({ top: rect.top + rect.height / 2, left: rect.right + 10 });
    setHoveredIndex(index);
    setLoading(true);

    try {
      const res = await axios.get(
        'https://televisions-replacement-gsm-promising.trycloudflare.com/getAnimeInfo',
        { params: { animeId } }
      );
      const a = res.data.animeInfo;
      setTitle(a.title);
      setDesc(a.desc);
      setAnimeState(a.state);
      
      setGenres(Array.isArray(a.genres) ? a.genres : []);
    } finally {
      setLoading(false);
    }
  };

  /* ===================== JSX ===================== */
  return (
    <>
      {/* HEADER */}
      <header>
        <Link to="/" className="logo">
          <span className="brand">11Anime</span>
        </Link>

        <div className="searchBox">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              handleSearch(e.target.value);
            }}
            placeholder="أدخل اسم الأنمي"
          />
          {showResults && (
            <div ref={ress} id="ress">
              {results?.map((elm) => (
                <Link key={elm.animeId} to={`/watch?animeId=${elm.animeId}`}>
                  <img
                    crossOrigin="anonymous"
                    src={elm.poster}
                    alt={elm.title}
                  />
                  <span>{elm.title}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* CONTENT */}
      <h1 ref={ti} id="ancre">آخر الحلقات</h1>

      {loading2 ? (
        <div className="spinner2" />
      ) : (
        <div className="grid">
          {currentItems.map((elm, index) => (
            <div
              key={elm.animeId}
              ref={(el) => (refs.current[index] = el)}
              onMouseEnter={() => handleMouseEnter(elm.animeId, index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() =>
                navigate(`/watch?animeId=${elm.animeId}&episodeHref=${elm.episodeHref}`)
              }
            >
              <img crossOrigin="anonymous" src={elm.poster} alt="" />
              {hoveredIndex === index && (
                <div
                  className="tooltip"
                  style={{
                    top: tooltipPos.top,
                    left: tooltipPos.left,
                  }}
                >
                  {loading ? (
                    <div className="spinner" />
                  ) : (
                    <>
                      <strong>{title}</strong>
                      <p>{desc || 'N/A'}</p>
                      <p>الحالة: {animeState || 'N/A'}</p>
                      <p>التصنيف: {genres.join(', ') || 'N/A'}</p>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default Home;
