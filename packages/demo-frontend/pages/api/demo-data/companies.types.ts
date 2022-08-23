export interface Organisasjon {
    organisasjonsnummer: string
    navn: string
    organisasjonsform: Organisasjonsform
    postadresse: Postadresse
    registreringsdatoEnhetsregisteret: string
    registrertIMvaregisteret: boolean
    naeringskode1: Naeringskode1
    antallAnsatte: number
    forretningsadresse: Forretningsadresse
    stiftelsesdato: string
    institusjonellSektorkode: InstitusjonellSektorkode
    registrertIForetaksregisteret: boolean
    registrertIStiftelsesregisteret: boolean
    registrertIFrivillighetsregisteret: boolean
    konkurs: boolean
    underAvvikling: boolean
    underTvangsavviklingEllerTvangsopplosning: boolean
    maalform: string
    links: any[]
  }
  
  export interface Organisasjonsform {
    kode: string
    beskrivelse: string
    links: any[]
  }
  
  export interface Postadresse {
    land: string
    landkode: string
    postnummer: string
    poststed: string
    adresse: string[]
    kommune: string
    kommunenummer: string
  }
  
  export interface Naeringskode1 {
    beskrivelse: string
    kode: string
  }
  
  export interface Forretningsadresse {
    land: string
    landkode: string
    postnummer: string
    poststed: string
    adresse: any[]
    kommune: string
    kommunenummer: string
  }
  
  export interface InstitusjonellSektorkode {
    kode: string
    beskrivelse: string
  }
  