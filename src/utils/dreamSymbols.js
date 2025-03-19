/**
 * Comprehensive dream symbols dictionary
 * Contains common dream symbols and their psychological interpretations
 */
const dreamSymbols = {
  // Moving and travel symbols
  flying: 'Represents freedom, ambition, or escaping limitations',
  falling: 'May symbolize insecurity, loss of control, or failure',
  chase: 'May represent avoiding a problem or feeling threatened',
  running: 'Often indicates a desire to escape from something or anxiety',
  swimming: 'Symbolizes emotional state or how you navigate through feelings',
  driving: 'Represents control over your life direction or journey',
  walking: 'Often represents progress in life, or the journey of life',
  climbing: 'Symbolizes ambition, struggle, or challenging yourself',
  
  // Environmental symbols
  water: 'Often relates to emotions, the unconscious mind, or purification',
  fire: 'Can symbolize transformation, passion, destruction, or purification',
  earth: 'Represents stability, groundedness, or fertility',
  wind: 'May indicate changes, forces beyond your control, or freedom',
  storm: 'Often symbolizes emotional turmoil or brewing conflict',
  mountain: 'Represents challenges, ambition, or feeling "on top" of a situation',
  forest: 'Can represent the unknown, mystery, or personal growth',
  desert: 'May symbolize isolation, spiritual seeking, or feeling empty',
  ocean: 'Often represents the unconscious mind, vastness, or overwhelming emotions',
  river: 'Symbolizes the flow of life, a journey, or changing emotions',
  beach: 'Can represent a boundary between conscious and unconscious mind',
  island: 'Often symbolizes isolation, independence, or feeling cut off',
  cave: 'May represent the unconscious, hidden aspects of self, or retreat',
  snow: 'Can symbolize purity, coldness, emotional numbness, or a fresh start',
  rain: 'Often represents cleansing, emotional release, or renewal',
  
  // Buildings and structures
  house: 'Typically symbolizes the self, personal identity, or security',
  school: 'Often relates to learning experiences or unresolved childhood issues',
  hospital: 'May represent healing, health concerns, or vulnerability',
  church: 'Can symbolize spiritual beliefs, moral questions, or sanctuary',
  tower: 'Often represents ambition, isolation, or perspective',
  bridge: 'Symbolizes transitions, connections, or overcoming obstacles',
  elevator: 'Can represent changing social status or emotional states',
  stairs: 'Often symbolize progress, transitions between levels of consciousness',
  door: 'Represents opportunity, transition, or new beginnings',
  window: 'Symbolizes perspective, outlook, or a view into other possibilities',
  room: 'Often represents a state of mind or aspect of yourself',
  basement: 'Typically represents the unconscious or things hidden from awareness',
  attic: 'Can symbolize forgotten memories or aspects of the higher self',
  
  // People and relationships
  mother: 'Represents nurturing, protection, or origin',
  father: 'Often symbolizes authority, guidance, or traditional values',
  child: 'May represent innocence, vulnerability, or a new beginning',
  stranger: 'Often symbolizes unknown aspects of yourself or new situations',
  crowd: 'Can represent social pressure, overwhelm, or anonymity',
  friend: 'Might symbolize aspects of yourself or support in your life',
  enemy: 'Often represents rejected aspects of self or perceived threats',
  lover: 'May symbolize desire, intimacy, or aspects of yourself you find attractive',
  teacher: 'Often represents wisdom, guidance, or needing to learn a lesson',
  doctor: 'Can symbolize a need for healing or authority figures',
  police: 'May represent authority, judgment, or internal moral judgment',
  
  // Animals
  dog: 'Often represents loyalty, friendship, or protection',
  cat: 'May symbolize independence, mystery, or feminine energy',
  snake: 'May symbolize transformation, knowledge, healing, or hidden fears',
  bird: 'Often represents freedom, perspective, or spiritual aspirations',
  spider: 'Can symbolize creativity, entrapment, or manipulation',
  horse: 'Often represents personal power, freedom, or sexual energy',
  fish: 'May symbolize the unconscious, spirituality, or fertility',
  lion: 'Often represents courage, strength, or unleashed power',
  tiger: 'Can symbolize fierceness, sexual energy, or raw emotion',
  bear: 'May represent introspection, strength, or danger',
  wolf: 'Often symbolizes instinct, freedom, or guidance',
  butterfly: 'Represents transformation, renewal, or transcendence',
  insect: 'Can symbolize minor irritations, persistence, or feeling overwhelmed by small problems',
  
  // Objects and symbols
  teeth: 'Can represent anxiety, self-image concerns, or communication issues',
  money: 'Often symbolizes self-worth, power, or values',
  key: 'Represents access, solutions, or new opportunities',
  mirror: 'Often symbolizes self-reflection, identity, or truth',
  book: 'Can represent knowledge, memory, or life story',
  clock: 'Often represents time pressure, mortality, or life timing',
  phone: 'May symbolize communication or connection with others',
  computer: 'Can represent logic, modern thinking, or connectivity',
  car: 'Often symbolizes independence, life path, or how you present yourself',
  airplane: 'Represents ambition, rising above situations, or escape',
  boat: 'Symbolizes emotional journey, navigation through life',
  train: 'Can represent life\'s journey, direction, or predetermined path',
  food: 'Often represents nourishment, comfort, or fulfillment of needs',
  gun: 'May symbolize aggression, power, defense, or sexuality',
  knife: 'Can represent aggression, cutting ties, or precision',
  
  // Colors
  red: 'Often symbolizes passion, anger, danger, or vitality',
  blue: 'May represent calmness, peace, communication, or sadness',
  green: 'Symbolizes growth, healing, fertility, or jealousy',
  yellow: 'Often represents joy, intellect, or caution',
  purple: 'Can symbolize spirituality, royalty, or transformation',
  black: 'May represent the unknown, mystery, death, or shadow aspects',
  white: 'Often symbolizes purity, clarity, or emptiness',
  gray: 'Represents neutrality, depression, or uncertainty',
  gold: 'Symbolizes value, wisdom, or spiritual attainment',
  
  // Common scenarios
  death: 'Usually symbolizes change, endings, or transformation rather than literal death',
  birth: 'Represents new beginnings, creativity, or potential',
  wedding: 'Often symbolizes commitment, union of different aspects of self, or life transitions',
  exam: 'Can represent self-evaluation, testing, or fear of failure',
  naked: 'May symbolize vulnerability, authenticity, or fear of exposure',
  lost: 'Often represents uncertainty, lack of direction, or searching for identity',
  late: 'Can symbolize anxiety about missed opportunities or poor timing',
  unable_to_move: 'May represent feeling trapped, powerless, or unable to progress',
  unable_to_speak: 'Often symbolizes feeling unheard, repressed communication',
  unable_to_see: 'Can represent denial, avoidance, or lack of awareness',
  
  // Modern symbols
  social_media: 'May represent social connection, validation seeking, or public image',
  email: 'Often symbolizes communication, work stress, or information overload',
  internet: 'Can represent connectivity, information, or feeling overwhelmed',
  virus: 'May symbolize fear of contamination, vulnerability, or harmful influence',
  camera: 'Often represents self-image, memories, or being observed',
  television: 'Can symbolize passive consumption of ideas or escapism',
  celebrity: 'May represent aspects you admire or wish to emulate',
  
  // Bodily experiences
  flying: 'Often represents freedom, transcendence, or a new perspective',
  teeth_falling_out: 'Can symbolize anxiety about appearance, communication, or loss',
  paralysis: 'Often represents feeling stuck or powerless in waking life',
  chase: 'May symbolize avoidance of problems or feeling threatened',
  injury: 'Can represent emotional pain or vulnerability',
  illness: 'Often symbolizes fear, vulnerability, or need for healing',
  giant: 'May represent power disparity or feeling overwhelmed',
  tiny: 'Can symbolize insignificance, vulnerability, or feeling overlooked'
};

module.exports = dreamSymbols; 