export interface SubtitleTrack {
  lang: "ga" | "en";
  url: string;
}

export interface CinemaVideo {
  title: string;
  url: string;
  credit?: { author: string; license: string; sourceUrl: string };
  subtitles?: SubtitleTrack[];
}

const COMMONS = "https://upload.wikimedia.org/wikipedia/commons";
const page = (file: string) =>
  `https://commons.wikimedia.org/wiki/File:${file}`;

// Subtitle tracks that community members add on Commons are served as CORS-enabled WebVTT.
const commonsSubs = (file: string, lang: SubtitleTrack["lang"]): SubtitleTrack => ({
  lang,
  url: `https://commons.wikimedia.org/w/api.php?action=timedtext&title=${encodeURIComponent(
    `File:${file}`,
  )}&lang=${lang}&trackformat=vtt&origin=*`,
});

// Public-domain White House clips filmed in Ireland, with English subtitles.
const SUBTITLED_VIDEOS: CinemaVideo[] = [
  {
    title: "County Mayo – Biden's Irish visit (EN subs)",
    url: `${COMMONS}/0/00/County_Mayo%2C_Ireland-_Check_in_with_Vice_President_Biden.webm`,
    subtitles: [
      commonsSubs("County_Mayo,_Ireland-_Check_in_with_Vice_President_Biden.webm", "en"),
    ],
    credit: {
      author: "The White House",
      license: "Public domain",
      sourceUrl: page(
        "County_Mayo,_Ireland-_Check_in_with_Vice_President_Biden.webm",
      ),
    },
  },
  {
    title: "County Louth – Biden's Irish visit (EN subs)",
    url: `${COMMONS}/1/12/County_Louth%2C_Ireland-_Check_in_with_Vice_President_Biden.webm`,
    subtitles: [
      commonsSubs("County_Louth,_Ireland-_Check_in_with_Vice_President_Biden.webm", "en"),
    ],
    credit: {
      author: "The White House",
      license: "Public domain",
      sourceUrl: page(
        "County_Louth,_Ireland-_Check_in_with_Vice_President_Biden.webm",
      ),
    },
  },
  {
    title: "Dublin Castle – Biden's Irish visit (EN subs)",
    url: `${COMMONS}/6/65/Dublin_Castle%2C_Ireland-_Check_in_with_Vice_President_Biden.webm`,
    subtitles: [
      commonsSubs("Dublin_Castle,_Ireland-_Check_in_with_Vice_President_Biden.webm", "en"),
    ],
    credit: {
      author: "The White House",
      license: "Public domain",
      sourceUrl: page(
        "Dublin_Castle,_Ireland-_Check_in_with_Vice_President_Biden.webm",
      ),
    },
  },
];

// Openly licensed Irish-language videos from Wikimedia Commons (served with CORS enabled).
const IRISH_VIDEOS: CinemaVideo[] = [
  {
    title: "Raidió Fáilte @ 20 – An Todhchaí",
    url: `${COMMONS}/7/7d/Raidi%C3%B3_F%C3%A1ilte_%40_20_%E2%80%93_An_Todhcha%C3%AD_The_Future_Near_FM_%28GA-EN%29_%282026%29.webm`,
    credit: {
      author: "Darren J. Prior / Near FM",
      license: "CC BY 4.0",
      sourceUrl: page(
        "Raidi%C3%B3_F%C3%A1ilte_@_20_%E2%80%93_An_Todhcha%C3%AD_The_Future_Near_FM_(GA-EN)_(2026).webm",
      ),
    },
  },
  {
    title: "Cúla4 – Niamh Ní Chróinín",
    url: `${COMMONS}/8/8e/Seoladh_C%C3%BAla4_cain%C3%A9al_Gaeilge_nua_do_leana%C3%AD_-_Niamh_N%C3%AD_Chr%C3%B3in%C3%ADn_-_Near_FM_%282023%29.webm`,
    credit: {
      author: "Darren J. Prior / Near FM",
      license: "CC BY 4.0",
      sourceUrl: page(
        "Seoladh_C%C3%BAla4_cain%C3%A9al_Gaeilge_nua_do_leana%C3%AD_-_Niamh_N%C3%AD_Chr%C3%B3in%C3%ADn_-_Near_FM_(2023).webm",
      ),
    },
  },
  {
    title: "Spriocanna Forbartha Inbhuanaithe",
    url: `${COMMONS}/d/d1/Seisi%C3%BAn_faisn%C3%A9ise_ar_Spriocanna_Forbartha_Inbhuanaithe_don_tsocha%C3%AD_shibhialta_baile-_Baile_%C3%81tha_Cliath_Dublin_%282015%29.webm`,
    credit: {
      author: "Darren J. Prior / Near FM",
      license: "CC BY-SA 4.0",
      sourceUrl: page(
        "Seisi%C3%BAn_faisn%C3%A9ise_ar_Spriocanna_Forbartha_Inbhuanaithe_don_tsocha%C3%AD_shibhialta_baile-_Baile_%C3%81tha_Cliath_Dublin_(2015).webm",
      ),
    },
  },
  {
    title: "Jim Higgins (ga)",
    url: `${COMMONS}/3/33/Higgins%2C_Jim_%28ga%29.webm`,
    credit: {
      author: "Manuel Schneider",
      license: "CC BY 3.0",
      sourceUrl: page("Higgins,_Jim_(ga).webm"),
    },
  },
  {
    title: "Pádraig Phádraig Thomáis – Mayo Irish",
    url: `${COMMONS}/5/5c/P%C3%A1draig_Ph%C3%A1draig_Thom%C3%A1is_speaking_Irish_Gaelic_%28Mayo_dialect%29.webm`,
    credit: {
      author: "Wikitongues",
      license: "CC BY 4.0",
      sourceUrl: page(
        "P%C3%A1draig_Ph%C3%A1draig_Thom%C3%A1is_speaking_Irish_Gaelic_(Mayo_dialect).webm",
      ),
    },
  },
  {
    title: "Seoladh Cúla4 – Irish kids' TV channel",
    url: `${COMMONS}/5/5f/Seoladh_C%C3%BAla4%2C_cain%C3%A9al_teilif%C3%ADse_nua_Gaeilge_do_leana%C3%AD._Launch_of_children%27s_Irish-language_television_channel_C%C3%BAla4._Niamh_N%C3%AD_Chr%C3%B3in%C3%ADn_%40_Near_FM_%28GA-EN%29_%282023%29.webm`,
    credit: {
      author: "Darren J. Prior / Near FM",
      license: "CC BY 4.0",
      sourceUrl: page(
        "Seoladh_C%C3%BAla4,_cain%C3%A9al_teilif%C3%ADse_nua_Gaeilge_do_leana%C3%AD._Launch_of_children%27s_Irish-language_television_channel_C%C3%BAla4._Niamh_N%C3%AD_Chr%C3%B3in%C3%ADn_@_Near_FM_(GA-EN)_(2023).webm",
      ),
    },
  },
  {
    title: "Acht na dTeangacha Oifigiúla – Éamon Ó Cuív",
    url: `${COMMONS}/8/88/An_tAcht_na_dTeangacha_Oifigi%C3%BAla_The_Official_Languages_Act_2003_%40_20_in_2023._%C3%89amon_%C3%93_Cu%C3%ADv_TD_%28EN-GA%29.webm`,
    credit: {
      author: "Darren J. Prior / Near FM",
      license: "CC BY 4.0",
      sourceUrl: page(
        "An_tAcht_na_dTeangacha_Oifigi%C3%BAla_The_Official_Languages_Act_2003_@_20_in_2023._%C3%89amon_%C3%93_Cu%C3%ADv_TD_(EN-GA).webm",
      ),
    },
  },
  {
    title: "Seirbhísí stáit as Gaeilge – Páidí Ó Lionáird",
    url: `${COMMONS}/6/69/Seirbh%C3%ADs%C3%AD_st%C3%A1it_as_Gaeilge_%E2%80%93_P%C3%A1id%C3%AD_%C3%93_Lion%C3%A1ird%2C_Oifig_an_Choimisin%C3%A9ara_Teanga_%E2%80%93_Near_FM_%282026%29.webm`,
    credit: {
      author: "Darren J. Prior / Near FM",
      license: "CC BY 4.0",
      sourceUrl: page(
        "Seirbh%C3%ADs%C3%AD_st%C3%A1it_as_Gaeilge_%E2%80%93_P%C3%A1id%C3%AD_%C3%93_Lion%C3%A1ird,_Oifig_an_Choimisin%C3%A9ara_Teanga_%E2%80%93_Near_FM_(2026).webm",
      ),
    },
  },
  {
    title: "Teachtaireacht Lá Fhéile Pádraig – Micheál D.",
    url: `${COMMONS}/9/90/Teachtaireacht_L%C3%A1_Fh%C3%A9ile_P%C3%A1draig_2021_%C3%B3n_Uachtar%C3%A1n_Miche%C3%A1l_D._%C3%93_hUig%C3%ADnn-VRg-a0qSGa8.webm`,
    credit: {
      author: "Áras an Uachtaráin",
      license: "Public domain",
      sourceUrl: page(
        "Teachtaireacht_L%C3%A1_Fh%C3%A9ile_P%C3%A1draig_2021_%C3%B3n_Uachtar%C3%A1n_Miche%C3%A1l_D._%C3%93_hUig%C3%ADnn-VRg-a0qSGa8.webm",
      ),
    },
  },
  {
    title: "Teachtaireacht na Nollag – Micheál D.",
    url: `${COMMONS}/0/09/Teachtaireacht_na_Nollag_agus_na_hAthbhliana_%C3%B3_Uachtar%C3%A1n_na_h%C3%89ireann_Miche%C3%A1l_D._%C3%93_hUig%C3%ADnn-BY2NF-lawPQ.webm`,
    credit: {
      author: "Áras an Uachtaráin",
      license: "Public domain",
      sourceUrl: page(
        "Teachtaireacht_na_Nollag_agus_na_hAthbhliana_%C3%B3_Uachtar%C3%A1n_na_h%C3%89ireann_Miche%C3%A1l_D._%C3%93_hUig%C3%ADnn-BY2NF-lawPQ.webm",
      ),
    },
  },
];

// Drop video files into src/assets/videos and they show up in the cinema automatically.
const modules = import.meta.glob(
  "/src/assets/videos/*.{mp4,webm,mov,m4v,ogv}",
  {
    eager: true,
    query: "?url",
    import: "default",
  },
) as Record<string, string>;

const LOCAL_VIDEOS: CinemaVideo[] = Object.entries(modules)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([path, url]) => ({
    title: path
      .split("/")
      .pop()!
      .replace(/\.[^.]+$/, "")
      .replace(/[-_]+/g, " ")
      .trim(),
    url,
  }));

// Subtitled videos come first so they are what people see first.
export const VIDEOS: CinemaVideo[] = [
  ...SUBTITLED_VIDEOS,
  ...IRISH_VIDEOS,
  ...LOCAL_VIDEOS,
];
