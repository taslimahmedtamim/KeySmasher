import {
  WORD_LIST_BEGINNER,
  WORD_LIST_INTERMEDIATE,
  WORD_LIST_ADVANCED,
} from '../passages/words';

const EXTRA_DRILL_WORDS = [
  // Rich single-word coverage for every key a-z (including rare letters b, f, j, k, q, v, x, z)
  'absorb', 'abstract', 'active', 'adjust', 'advance', 'affect', 'afford', 'afraid',
  'against', 'agenda', 'almost', 'alone', 'always', 'amazing', 'among', 'amount',
  'anchor', 'angle', 'answer', 'antique', 'anxious', 'apart', 'appeal', 'appear',
  'apple', 'apply', 'arcade', 'arena', 'argue', 'arise', 'arrange', 'arrive',
  'aspect', 'assert', 'assist', 'assume', 'assure', 'attack', 'attempt', 'attend',
  'august', 'author', 'avenue', 'avoid', 'awake', 'award', 'aware', 'awful',
  'axis', 'axle', 'bacon', 'badge', 'badly', 'baker', 'balance', 'banquet',
  'barber', 'barrel', 'barrier', 'basic', 'basket', 'battle', 'beacon', 'beauty',
  'become', 'before', 'begin', 'behalf', 'behind', 'belief', 'belong', 'below',
  'bench', 'beneath', 'benefit', 'beside', 'beyond', 'bicycle', 'binary', 'bishop',
  'bitter', 'black', 'blade', 'blame', 'blank', 'blast', 'blaze', 'bleed',
  'blend', 'bless', 'blind', 'blink', 'block', 'bloom', 'blown', 'board',
  'boast', 'bonus', 'boost', 'booth', 'border', 'borrow', 'boss', 'bottle',
  'bottom', 'bounce', 'bound', 'bowl', 'box', 'boxed', 'boxer', 'brain',
  'brake', 'branch', 'brand', 'brass', 'brave', 'bread', 'break', 'breath',
  'breeze', 'brick', 'bride', 'bridge', 'brief', 'bright', 'bring', 'brisk',
  'broad', 'broke', 'broken', 'bronze', 'brook', 'broom', 'brother', 'brought',
  'brown', 'brush', 'bubble', 'bucket', 'budget', 'buffer', 'build', 'built',
  'bulb', 'bulk', 'bullet', 'bump', 'bunch', 'bundle', 'burden', 'burst',
  'butter', 'button', 'buyer', 'buzz', 'buzzer', 'cabin', 'cable', 'cache',
  'cadence', 'camera', 'campus', 'cancel', 'candle', 'canvas', 'capable', 'carbon',
  'career', 'careful', 'carpet', 'carrier', 'carry', 'castle', 'casual', 'catch',
  'cause', 'caution', 'center', 'chance', 'change', 'chaos', 'charge', 'chart',
  'chase', 'cheap', 'check', 'cheek', 'cheer', 'cheese', 'chest', 'chief',
  'choice', 'choose', 'chunk', 'churn', 'circle', 'citizen', 'claim', 'clamp',
  'clarity', 'classic', 'clean', 'clear', 'clerk', 'clever', 'click', 'client',
  'cliff', 'climb', 'cling', 'clock', 'close', 'cloth', 'cloud', 'clown',
  'coach', 'coast', 'coffee', 'collect', 'column', 'combat', 'combine', 'comfort',
  'command', 'comment', 'commit', 'common', 'compact', 'compare', 'compete', 'compile',
  'complex', 'compose', 'concept', 'concern', 'conclude', 'confirm', 'conflict', 'connect',
  'conquer', 'consent', 'consist', 'console', 'constant', 'construct', 'consume', 'contact',
  'contain', 'content', 'contest', 'context', 'control', 'convert', 'convey', 'cookie',
  'copper', 'corner', 'correct', 'costume', 'cotton', 'council', 'count', 'counter',
  'country', 'couple', 'courage', 'course', 'court', 'cover', 'craft', 'crash',
  'crate', 'crazy', 'cream', 'create', 'credit', 'creed', 'creek', 'crest',
  'cricket', 'crisp', 'critic', 'cross', 'crowd', 'crown', 'crucial', 'crude',
  'cruel', 'cruise', 'crush', 'crust', 'crystal', 'culture', 'curious', 'current',
  'curtain', 'curve', 'custom', 'cycle', 'cynic', 'daily', 'damage', 'dance',
  'danger', 'daring', 'darken', 'dashed', 'dazzle', 'debate', 'decade', 'decay',
  'decide', 'deck', 'declare', 'decline', 'decode', 'decor', 'deduce', 'deeply',
  'defeat', 'defend', 'define', 'degree', 'delay', 'delete', 'deliver', 'demand',
  'denial', 'dental', 'depart', 'depend', 'deploy', 'deposit', 'depth', 'deputy',
  'derive', 'desert', 'design', 'desire', 'detail', 'detect', 'device', 'devise',
  'devote', 'diagram', 'dial', 'dialog', 'diamond', 'diary', 'dictate', 'differ',
  'digest', 'digital', 'dignity', 'dilemma', 'diminish', 'dinner', 'direct', 'discuss',
  'display', 'dispute', 'distant', 'distinct', 'diverse', 'divide', 'divine', 'dizzy',
  'doctor', 'domain', 'donate', 'double', 'doubt', 'dozen', 'draft', 'dragon',
  'drain', 'drama', 'drastic', 'drawer', 'dream', 'dress', 'drift', 'drill',
  'drink', 'drive', 'drizzle', 'drop', 'drought', 'drum', 'dryer', 'dual',
  'dynamic', 'eager', 'eagle', 'early', 'earth', 'easily', 'easter', 'echo',
  'edge', 'edit', 'editor', 'educate', 'effect', 'effort', 'eighth', 'either',
  'elastic', 'elbow', 'elder', 'elect', 'elegant', 'element', 'elevate', 'elite',
  'embark', 'embrace', 'emerge', 'emotion', 'emphasis', 'employ', 'empower', 'empty',
  'enable', 'enact', 'encode', 'endless', 'endorse', 'endure', 'energy', 'enforce',
  'engage', 'engine', 'enhance', 'enjoy', 'enlarge', 'enough', 'enrich', 'enroll',
  'ensure', 'enter', 'entire', 'entity', 'entry', 'envelope', 'equal', 'equip',
  'erase', 'errand', 'error', 'escape', 'essay', 'essence', 'estate', 'esteem',
  'ethics', 'evolve', 'exact', 'exam', 'example', 'exceed', 'excel', 'except',
  'excess', 'exchange', 'excite', 'exclude', 'excuse', 'execute', 'exempt', 'exert',
  'exhibit', 'exist', 'exit', 'exotic', 'expand', 'expect', 'expense', 'expert',
  'expire', 'explain', 'explode', 'explore', 'export', 'expose', 'express', 'extend',
  'extent', 'extra', 'extreme', 'fabric', 'facet', 'factor', 'faculty', 'fade',
  'fail', 'faint', 'fairly', 'faith', 'false', 'fame', 'family', 'famous',
  'fancy', 'fantasy', 'farther', 'fashion', 'fasten', 'fatal', 'father', 'fatigue',
  'fault', 'favor', 'fearless', 'feast', 'feather', 'feature', 'federal', 'fellow',
  'fence', 'ferry', 'fertile', 'fetch', 'fever', 'fiber', 'fiction', 'field',
  'fierce', 'fifteen', 'fifth', 'fifty', 'fight', 'figure', 'file', 'fill',
  'film', 'filter', 'final', 'finance', 'finding', 'fine', 'finger', 'finish',
  'finite', 'firmly', 'first', 'fiscal', 'five', 'fixed', 'fixture', 'fizz',
  'flag', 'flame', 'flank', 'flash', 'flat', 'flavor', 'flaw', 'fleet',
  'flesh', 'flight', 'fling', 'flip', 'float', 'flock', 'flood', 'floor',
  'flora', 'flour', 'flow', 'flower', 'fluent', 'fluid', 'flush', 'flute',
  'foam', 'focus', 'foggy', 'foil', 'fold', 'folk', 'follow', 'fond',
  'food', 'foolish', 'foot', 'forbid', 'force', 'ford', 'forecast', 'foreign',
  'forest', 'forever', 'forget', 'forgive', 'fork', 'formal', 'format', 'former',
  'formula', 'forth', 'fortune', 'forty', 'forum', 'forward', 'fossil', 'foster',
  'found', 'founder', 'four', 'fourth', 'fox', 'fraction', 'fragile', 'frame',
  'frank', 'fraud', 'free', 'freedom', 'freeze', 'freight', 'french', 'frequent',
  'fresh', 'friend', 'fright', 'fringe', 'frog', 'from', 'front', 'frost',
  'frown', 'frozen', 'fruit', 'fry', 'fuel', 'fulfill', 'full', 'fully',
  'fume', 'fun', 'function', 'fund', 'funny', 'furious', 'furnace', 'furnish',
  'further', 'fury', 'fuse', 'fusion', 'future', 'fuzz', 'gadget', 'gain',
  'galaxy', 'gallery', 'gallon', 'gamble', 'game', 'garage', 'garden', 'garlic',
  'garment', 'gather', 'gauge', 'gaze', 'gear', 'gender', 'general', 'generic',
  'genius', 'gentle', 'genuine', 'gesture', 'giant', 'gift', 'giggle', 'given',
  'glacier', 'gladly', 'glance', 'glare', 'glass', 'gleam', 'glide', 'glimpse',
  'global', 'globe', 'gloom', 'glory', 'gloss', 'glove', 'glow', 'glue',
  'goal', 'gold', 'golf', 'good', 'goose', 'gossip', 'govern', 'grab',
  'grace', 'grade', 'grain', 'grand', 'grant', 'grape', 'graph', 'grasp',
  'grass', 'grateful', 'grave', 'gravity', 'graze', 'great', 'greed', 'green',
  'greet', 'grid', 'grief', 'grill', 'grin', 'grind', 'grip', 'grit',
  'groan', 'grocery', 'groom', 'groove', 'gross', 'ground', 'group', 'grow',
  'growth', 'guard', 'guess', 'guest', 'guide', 'guilt', 'guitar', 'gulf',
  'habit', 'hacker', 'hammer', 'handle', 'happen', 'happy', 'harbor', 'hardly',
  'harm', 'harvest', 'haste', 'hatch', 'hazard', 'haze', 'heading', 'health',
  'heap', 'heart', 'hearth', 'heat', 'heavy', 'hedge', 'height', 'hello',
  'helmet', 'helpful', 'hence', 'heroic', 'hidden', 'highway', 'hinge', 'history',
  'hobby', 'hollow', 'honest', 'honey', 'honor', 'hope', 'horizon', 'horror',
  'horse', 'host', 'hotel', 'hourly', 'house', 'hover', 'human', 'humble',
  'humor', 'hunger', 'hunter', 'hurry', 'hurt', 'hybrid', 'hyper', 'icon',
  'ideal', 'identify', 'idle', 'ignite', 'ignore', 'illegal', 'illness', 'image',
  'imagine', 'impact', 'impart', 'implement', 'imply', 'import', 'impose', 'impress',
  'improve', 'impulse', 'inch', 'incident', 'include', 'income', 'increase', 'incur',
  'indeed', 'index', 'indicate', 'indoor', 'induce', 'industry', 'infant', 'infect',
  'infer', 'infinite', 'inform', 'initial', 'inject', 'injure', 'ink', 'inland',
  'inmate', 'inner', 'innocent', 'input', 'inquire', 'insect', 'insert', 'inside',
  'insight', 'insist', 'inspect', 'inspire', 'install', 'instance', 'instant', 'instead',
  'instinct', 'instruct', 'insult', 'insure', 'intact', 'intake', 'intend', 'intense',
  'intent', 'interact', 'interest', 'interior', 'internal', 'interval', 'intimate', 'into',
  'intrigue', 'invade', 'invalid', 'invent', 'invest', 'invite', 'involve', 'inward',
  'irony', 'island', 'isolate', 'issue', 'item', 'ivory', 'jacket', 'jaguar',
  'jail', 'jam', 'january', 'jar', 'jaw', 'jazz', 'jealous', 'jeans',
  'jeep', 'jelly', 'jerk', 'jest', 'jet', 'jewel', 'jigsaw', 'jingle',
  'job', 'jockey', 'jog', 'join', 'joint', 'joke', 'jolly', 'jolt',
  'journal', 'journey', 'joy', 'joyful', 'judge', 'juice', 'juicy', 'jumble',
  'jumbo', 'jump', 'jumper', 'junction', 'june', 'jungle', 'junior', 'junk',
  'jury', 'just', 'justice', 'justify', 'keen', 'keep', 'keeper', 'kennel',
  'kept', 'kernel', 'kettle', 'key', 'keyboard', 'keypad', 'keystroke', 'kick',
  'kidnap', 'kidney', 'kill', 'kindly', 'kingdom', 'kiosk', 'kiss', 'kitchen',
  'kite', 'kitten', 'knee', 'kneel', 'knew', 'knife', 'knight', 'knit',
  'knob', 'knock', 'knot', 'know', 'known', 'knuckle', 'koala', 'label',
  'labor', 'ladder', 'lady', 'lake', 'lamb', 'lamp', 'land', 'lane',
  'language', 'lantern', 'laptop', 'large', 'laser', 'last', 'late', 'later',
  'latest', 'laugh', 'launch', 'laundry', 'lava', 'lawn', 'lawsuit', 'lawyer',
  'layer', 'lazy', 'lead', 'leader', 'leaf', 'league', 'leak', 'lean',
  'leap', 'learn', 'lease', 'least', 'leather', 'leave', 'lecture', 'ledge',
  'left', 'legal', 'legend', 'leisure', 'lemon', 'lend', 'length', 'lens',
  'less', 'lesson', 'letter', 'level', 'lever', 'liberty', 'library', 'license',
  'lift', 'light', 'like', 'likely', 'limit', 'line', 'linear', 'linger',
  'link', 'lion', 'liquid', 'list', 'listen', 'liter', 'little', 'live',
  'lively', 'liver', 'living', 'lizard', 'load', 'loaf', 'loan', 'lobby',
  'local', 'locate', 'lock', 'lodge', 'loft', 'logic', 'lonely', 'long',
  'look', 'loop', 'loose', 'loot', 'lord', 'lose', 'loss', 'lost',
  'lotion', 'loud', 'lounge', 'love', 'lovely', 'lover', 'low', 'lower',
  'loyal', 'luck', 'lucky', 'luggage', 'lumber', 'lunar', 'lunch', 'lung',
  'lure', 'luxury', 'lyric', 'machine', 'macro', 'madam', 'magic', 'magnet',
  'maiden', 'mail', 'main', 'mainly', 'major', 'make', 'maker', 'manage',
  'mango', 'manner', 'manual', 'maple', 'marble', 'march', 'margin', 'marine',
  'mark', 'market', 'marriage', 'marry', 'marsh', 'marvel', 'mask', 'mass',
  'master', 'match', 'matrix', 'matter', 'mature', 'maximum', 'maybe', 'mayor',
  'maze', 'meadow', 'meal', 'mean', 'meaning', 'measure', 'medal', 'media',
  'medium', 'meet', 'melody', 'melt', 'member', 'memo', 'memory', 'mental',
  'mention', 'menu', 'mercy', 'merge', 'merit', 'merry', 'mesh', 'message',
  'metal', 'meter', 'method', 'metric', 'middle', 'mighty', 'mild', 'mile',
  'milk', 'mill', 'mimic', 'mind', 'mine', 'mineral', 'minimal', 'minimum',
  'minor', 'mint', 'minus', 'minute', 'miracle', 'mirror', 'miss', 'mist',
  'mistake', 'mixed', 'mixer', 'mobile', 'mock', 'mode', 'model', 'modern',
  'modest', 'modify', 'module', 'moist', 'moment', 'money', 'monitor', 'monkey',
  'month', 'mood', 'moon', 'moral', 'more', 'morning', 'mortal', 'mostly',
  'mother', 'motion', 'motive', 'motor', 'mount', 'mouse', 'mouth', 'move',
  'movie', 'much', 'mud', 'muffin', 'mule', 'multi', 'mumble', 'murder',
  'muscle', 'museum', 'music', 'must', 'mutual', 'myself', 'mystery', 'myth',
  'nail', 'naive', 'name', 'napkin', 'narrow', 'nation', 'native', 'nature',
  'naval', 'near', 'nearly', 'neat', 'neck', 'need', 'needle', 'neglect',
  'neither', 'nephew', 'nerve', 'nest', 'network', 'neutral', 'never', 'new',
  'newly', 'news', 'next', 'nice', 'night', 'nine', 'noble', 'nobody',
  'nod', 'noise', 'noisy', 'nomad', 'none', 'noon', 'norm', 'normal',
  'north', 'nose', 'notable', 'note', 'nothing', 'notice', 'notify', 'notion',
  'noun', 'novel', 'now', 'nozzle', 'nuclear', 'number', 'nurse', 'nut',
  'nylon', 'oak', 'oasis', 'oath', 'obey', 'object', 'oblige', 'obscure',
  'observe', 'obtain', 'obvious', 'occur', 'ocean', 'octave', 'october', 'odd',
  'offend', 'offer', 'office', 'often', 'oil', 'okay', 'old', 'olive',
  'omega', 'omit', 'once', 'onion', 'online', 'only', 'onto', 'open',
  'opera', 'opinion', 'oppose', 'optic', 'option', 'oracle', 'orange', 'orbit',
  'order', 'organ', 'orient', 'origin', 'other', 'ounce', 'our', 'out',
  'outcome', 'outdoor', 'outer', 'outfit', 'output', 'outrage', 'outside', 'oval',
  'oven', 'over', 'overall', 'owl', 'own', 'owner', 'oxygen', 'oyster',
  'ozone', 'pace', 'pack', 'package', 'packet', 'pad', 'paddle', 'page',
  'paid', 'pain', 'paint', 'pair', 'palace', 'pale', 'palm', 'pan',
  'panel', 'panic', 'paper', 'parade', 'parcel', 'pardon', 'parent', 'park',
  'part', 'partial', 'party', 'pass', 'passage', 'passion', 'passive', 'past',
  'paste', 'patch', 'path', 'patient', 'patrol', 'patron', 'pattern', 'pause',
  'pave', 'pawn', 'pay', 'peace', 'peach', 'peak', 'peanut', 'pear',
  'pearl', 'pedal', 'peek', 'peel', 'peer', 'pelican', 'pen', 'penalty',
  'pencil', 'pending', 'penny', 'people', 'pepper', 'percent', 'perfect', 'perform',
  'perhaps', 'period', 'permit', 'persist', 'person', 'pest', 'pet', 'petal',
  'phase', 'phone', 'photo', 'phrase', 'physics', 'piano', 'pick', 'picnic',
  'picture', 'piece', 'pierce', 'pig', 'pigeon', 'pike', 'pile', 'pill',
  'pillar', 'pillow', 'pilot', 'pin', 'pinch', 'pine', 'pink', 'pioneer',
  'pipe', 'pistol', 'pitch', 'pixel', 'pizza', 'place', 'plain', 'plan',
  'plane', 'planet', 'plank', 'plant', 'plastic', 'plate', 'play', 'player',
  'plea', 'please', 'pledge', 'plenty', 'plot', 'plow', 'pluck', 'plug',
  'plum', 'plunge', 'plural', 'plus', 'pocket', 'pod', 'poem', 'poet',
  'point', 'poise', 'poison', 'poke', 'polar', 'pole', 'police', 'policy',
  'polish', 'polite', 'poll', 'pollute', 'pond', 'pony', 'pool', 'poor',
  'pop', 'popular', 'porch', 'pork', 'port', 'portal', 'portion', 'pose',
  'position', 'positive', 'possess', 'possible', 'post', 'poster', 'pot', 'potato',
  'pottery', 'pouch', 'pound', 'pour', 'powder', 'power', 'practice', 'praise',
  'pray', 'preach', 'predict', 'prefer', 'prefix', 'premier', 'prepare', 'present',
  'preserve', 'press', 'pretty', 'prevail', 'prevent', 'preview', 'price', 'pride',
  'priest', 'primary', 'prime', 'prince', 'print', 'prior', 'prison', 'privacy',
  'private', 'prize', 'probe', 'problem', 'proceed', 'process', 'produce', 'product',
  'profit', 'program', 'project', 'promise', 'promote', 'prompt', 'proof', 'proper',
  'propose', 'protect', 'protein', 'protest', 'proud', 'prove', 'provide', 'province',
  'public', 'publish', 'pull', 'pulse', 'pump', 'punch', 'punish', 'pupil',
  'puppy', 'purchase', 'pure', 'purple', 'purpose', 'purse', 'pursue', 'push',
  'puzzle', 'pyramid', 'quail', 'quake', 'qualify', 'quality', 'quant', 'quarrel',
  'quart', 'quarter', 'queen', 'queer', 'quell', 'query', 'quest', 'question',
  'queue', 'quick', 'quickly', 'quiet', 'quietly', 'quill', 'quilt', 'quirk',
  'quit', 'quite', 'quiz', 'quota', 'quote', 'rabbit', 'race', 'rack',
  'radar', 'radio', 'radish', 'radius', 'rage', 'raid', 'rail', 'rain',
  'raise', 'rally', 'ramp', 'ranch', 'random', 'range', 'rank', 'rapid',
  'rare', 'rarely', 'rate', 'rather', 'ratio', 'raw', 'ray', 'razor',
  'reach', 'react', 'read', 'reader', 'ready', 'real', 'realize', 'really',
  'realm', 'reap', 'rear', 'reason', 'rebel', 'rebuild', 'recall', 'receive',
  'recent', 'recipe', 'reckon', 'record', 'recover', 'recruit', 'red', 'reduce',
  'reed', 'reef', 'refer', 'refine', 'reflect', 'reflex', 'reform', 'refresh',
  'refuge', 'refund', 'refuse', 'regain', 'regard', 'regime', 'region', 'register',
  'regret', 'regular', 'reject', 'relate', 'relax', 'relay', 'release', 'relief',
  'rely', 'remain', 'remark', 'remedy', 'remind', 'remote', 'remove', 'render',
  'renew', 'rent', 'repair', 'repeat', 'replace', 'reply', 'report', 'require',
  'rescue', 'research', 'resemble', 'reserve', 'reside', 'resign', 'resist', 'resolve',
  'resort', 'respect', 'respond', 'rest', 'restore', 'result', 'resume', 'retail',
  'retain', 'retire', 'retreat', 'return', 'reveal', 'revenge', 'revenue', 'reverse',
  'review', 'revise', 'revive', 'revolt', 'reward', 'rhythm', 'ribbon', 'rice',
  'rich', 'ride', 'ridge', 'rifle', 'right', 'rigid', 'ring', 'rinse',
  'riot', 'ripe', 'ripple', 'rise', 'risk', 'ritual', 'rival', 'river',
  'road', 'roam', 'roar', 'roast', 'rob', 'robe', 'robin', 'robot',
  'robust', 'rock', 'rocket', 'rod', 'role', 'roll', 'roof', 'rookie',
  'room', 'root', 'rope', 'rose', 'rotate', 'rotten', 'rough', 'round',
  'route', 'routine', 'row', 'royal', 'rub', 'rubber', 'rude', 'rug',
  'ruin', 'rule', 'ruler', 'rumor', 'run', 'runway', 'rural', 'rush',
  'rust', 'sack', 'sacred', 'sad', 'saddle', 'safe', 'safety', 'sail',
  'salad', 'salary', 'sale', 'salmon', 'salon', 'salt', 'salute', 'same',
  'sample', 'sand', 'sandwich', 'sane', 'sapphire', 'sauce', 'save', 'saving',
  'savor', 'say', 'scale', 'scan', 'scar', 'scarce', 'scare', 'scarf',
  'scene', 'scent', 'scheme', 'school', 'science', 'scissors', 'scope', 'score',
  'scout', 'scrap', 'scrape', 'scratch', 'scream', 'screen', 'screw', 'script',
  'scroll', 'scrub', 'sea', 'seal', 'seam', 'search', 'season', 'seat',
  'second', 'secret', 'section', 'sector', 'secure', 'see', 'seed', 'seek',
  'seem', 'segment', 'seize', 'select', 'self', 'sell', 'send', 'senior',
  'sense', 'sentence', 'separate', 'sequence', 'series', 'serious', 'serve', 'server',
  'service', 'session', 'set', 'settle', 'seven', 'several', 'severe', 'sew',
  'shade', 'shadow', 'shaft', 'shake', 'shall', 'shallow', 'shame', 'shape',
  'share', 'sharp', 'shatter', 'shave', 'shed', 'sheep', 'sheer', 'sheet',
  'shelf', 'shell', 'shelter', 'shepherd', 'shield', 'shift', 'shine', 'shiny',
  'ship', 'shirt', 'shock', 'shoe', 'shoot', 'shop', 'shore', 'short',
  'shot', 'should', 'shoulder', 'shout', 'shove', 'show', 'shower', 'shred',
  'shrewd', 'shrimp', 'shrink', 'shrug', 'shut', 'shutter', 'shy', 'sick',
  'side', 'siege', 'sigh', 'sight', 'sign', 'signal', 'silent', 'silk',
  'silly', 'silver', 'similar', 'simple', 'simply', 'since', 'sincere', 'sing',
  'singer', 'single', 'sink', 'sip', 'sister', 'sit', 'site', 'six',
  'sixth', 'sixty', 'size', 'skate', 'sketch', 'ski', 'skill', 'skin',
  'skip', 'skirt', 'skull', 'sky', 'slab', 'slack', 'slam', 'slap',
  'slash', 'slate', 'sled', 'sleep', 'sleet', 'sleeve', 'slice', 'slide',
  'slight', 'slim', 'sling', 'slip', 'slope', 'slot', 'slow', 'slowly',
  'slug', 'slump', 'small', 'smart', 'smash', 'smell', 'smile', 'smoke',
  'smooth', 'snack', 'snag', 'snail', 'snake', 'snap', 'snare', 'snatch',
  'sneak', 'sniff', 'snow', 'snug', 'soak', 'soap', 'soar', 'sober',
  'soccer', 'social', 'socket', 'soda', 'sofa', 'soft', 'soften', 'softly',
  'soil', 'solar', 'sold', 'soldier', 'sole', 'solid', 'solo', 'solve',
  'some', 'somehow', 'someone', 'song', 'soon', 'soothe', 'sore', 'sorry',
  'sort', 'soul', 'sound', 'soup', 'source', 'south', 'space', 'spade',
  'span', 'spare', 'spark', 'sparse', 'speak', 'spear', 'special', 'species',
  'specific', 'speech', 'speed', 'spell', 'spend', 'sphere', 'spice', 'spider',
  'spike', 'spill', 'spin', 'spine', 'spiral', 'spirit', 'spite', 'splash',
  'split', 'spoil', 'spoke', 'sponge', 'sponsor', 'spoon', 'sport', 'spot',
  'spouse', 'spray', 'spread', 'spring', 'sprint', 'sprout', 'spur', 'squad',
  'square', 'squash', 'squat', 'squeeze', 'stable', 'stack', 'staff', 'stage',
  'stain', 'stair', 'stake', 'stale', 'stalk', 'stall', 'stamp', 'stand',
  'standard', 'staple', 'star', 'stare', 'stark', 'start', 'starve', 'state',
  'static', 'station', 'statue', 'status', 'stay', 'steady', 'steak', 'steal',
  'steam', 'steel', 'steep', 'steer', 'stem', 'step', 'stereo', 'stern',
  'stew', 'stick', 'stiff', 'still', 'sting', 'stink', 'stir', 'stitch',
  'stock', 'stone', 'stool', 'stoop', 'stop', 'store', 'storm', 'story',
  'stove', 'strain', 'strand', 'strange', 'strap', 'straw', 'stray', 'streak',
  'stream', 'street', 'stress', 'stretch', 'strict', 'stride', 'strike', 'string',
  'strip', 'stripe', 'strive', 'stroke', 'strong', 'struck', 'struct', 'studio',
  'study', 'stuff', 'stumble', 'stump', 'stun', 'stunt', 'style', 'subject',
  'submit', 'subtle', 'subway', 'succeed', 'success', 'such', 'sudden', 'suffer',
  'sugar', 'suggest', 'suit', 'suite', 'sulfur', 'sum', 'summary', 'summer',
  'summit', 'sun', 'sunday', 'sunset', 'super', 'supply', 'support', 'suppose',
  'sure', 'surface', 'surge', 'survey', 'survive', 'suspect', 'sustain', 'swallow',
  'swamp', 'swap', 'swarm', 'sway', 'swear', 'sweat', 'sweep', 'sweet',
  'swell', 'swift', 'swim', 'swing', 'swipe', 'switch', 'sword', 'symbol',
  'symptom', 'sync', 'syntax', 'syrup', 'system', 'table', 'tackle', 'tact',
  'tag', 'tail', 'tailor', 'take', 'tale', 'talent', 'talk', 'tall',
  'tame', 'tan', 'tangle', 'tank', 'tap', 'tape', 'target', 'task',
  'taste', 'tattle', 'taught', 'tax', 'taxi', 'tea', 'teach', 'team',
  'tear', 'tease', 'tech', 'tedious', 'teen', 'teeth', 'tell', 'temper',
  'temple', 'tempo', 'tenant', 'tend', 'tender', 'tennis', 'tense', 'tent',
  'tenth', 'term', 'terms', 'terrace', 'test', 'text', 'texture', 'thank',
  'that', 'thaw', 'the', 'theater', 'theft', 'their', 'theme', 'then',
  'theory', 'there', 'thermal', 'these', 'thick', 'thief', 'thigh', 'thin',
  'thing', 'think', 'third', 'thirst', 'thirty', 'this', 'thorn', 'though',
  'thought', 'thread', 'threat', 'three', 'thrill', 'thrive', 'throat', 'throne',
  'throw', 'thrust', 'thumb', 'thump', 'thunder', 'thus', 'tick', 'ticket',
  'tide', 'tidy', 'tie', 'tiger', 'tight', 'tile', 'till', 'tilt',
  'timber', 'time', 'timid', 'tin', 'tingle', 'tinker', 'tint', 'tiny',
  'tip', 'tiptoe', 'tire', 'tissue', 'title', 'toast', 'today', 'toddle',
  'toe', 'together', 'token', 'told', 'tolerate', 'toll', 'tomato', 'tomb',
  'tone', 'tongue', 'tonight', 'too', 'took', 'tool', 'tooth', 'top',
  'topic', 'torch', 'torn', 'torque', 'torrent', 'toss', 'total', 'touch',
  'tough', 'tour', 'toward', 'towel', 'tower', 'town', 'toxic', 'toy',
  'trace', 'track', 'tract', 'trade', 'traffic', 'tragic', 'trail', 'train',
  'trait', 'tram', 'tramp', 'transfer', 'transit', 'trap', 'trash', 'travel',
  'tray', 'tread', 'treat', 'treaty', 'tree', 'trek', 'tremble', 'trend',
  'trial', 'tribe', 'trick', 'tried', 'trim', 'trio', 'trip', 'triple',
  'triumph', 'trolley', 'troop', 'trophy', 'tropic', 'trot', 'trouble', 'truck',
  'true', 'truly', 'trumpet', 'trunk', 'trust', 'truth', 'try', 'tub',
  'tube', 'tuck', 'tuft', 'tug', 'tulip', 'tumble', 'tuna', 'tune',
  'tunnel', 'turf', 'turkey', 'turn', 'turtle', 'tutor', 'tuxedo', 'twelve',
  'twenty', 'twice', 'twig', 'twin', 'twine', 'twirl', 'twist', 'two',
  'type', 'typing', 'typist', 'ugly', 'ultra', 'umbrella', 'unable', 'unaware',
  'uncle', 'under', 'undo', 'unfair', 'unfold', 'unify', 'union', 'unique',
  'unit', 'unite', 'unity', 'universe', 'unknown', 'unless', 'unlike', 'unlock',
  'until', 'unusual', 'update', 'upgrade', 'uphold', 'upon', 'upper', 'upset',
  'urban', 'urge', 'urgent', 'usage', 'use', 'useful', 'user', 'usual',
  'utmost', 'utter', 'vacant', 'vacuum', 'vague', 'vain', 'valid', 'valley',
  'value', 'valve', 'van', 'vanish', 'vanity', 'vapor', 'vary', 'vast',
  'vault', 'vector', 'velvet', 'vendor', 'venture', 'venue', 'verb', 'verify',
  'verse', 'version', 'versus', 'vertex', 'very', 'vessel', 'vest', 'veto',
  'viable', 'vibrant', 'vibrate', 'victim', 'victor', 'video', 'view', 'vigil',
  'vigor', 'villa', 'village', 'vine', 'vinyl', 'violin', 'virtual', 'virtue',
  'virus', 'visa', 'vision', 'visit', 'visual', 'vital', 'vivid', 'vocal',
  'voice', 'void', 'volt', 'volume', 'vote', 'vouch', 'vowel', 'voyage',
  'wade', 'wafer', 'wage', 'wagon', 'waist', 'wait', 'wake', 'walk',
  'wall', 'wallet', 'wander', 'want', 'ward', 'warm', 'warn', 'warp',
  'warrant', 'warrior', 'wash', 'wasp', 'waste', 'watch', 'water', 'wave',
  'wax', 'way', 'weak', 'wealth', 'weapon', 'wear', 'weary', 'weather',
  'weave', 'web', 'wedge', 'weed', 'week', 'weekly', 'weigh', 'weight',
  'weird', 'welcome', 'weld', 'welfare', 'well', 'west', 'wet', 'whale',
  'what', 'wheat', 'wheel', 'when', 'where', 'whereas', 'which', 'while',
  'whip', 'whirl', 'whisper', 'whistle', 'white', 'who', 'whole', 'whose',
  'why', 'wicked', 'wide', 'widely', 'widen', 'width', 'wife', 'wild',
  'will', 'willing', 'win', 'wind', 'window', 'wine', 'wing', 'wink',
  'winner', 'winter', 'wipe', 'wire', 'wisdom', 'wise', 'wish', 'wit',
  'witch', 'with', 'within', 'without', 'witness', 'wizard', 'woke', 'wolf',
  'woman', 'wonder', 'wood', 'wool', 'word', 'work', 'worker', 'world',
  'worm', 'worn', 'worry', 'worse', 'worst', 'worth', 'would', 'wound',
  'wrap', 'wrath', 'wreath', 'wreck', 'wrench', 'wrist', 'write', 'writer',
  'wrong', 'wrote', 'yacht', 'yard', 'yarn', 'year', 'yearly', 'yell',
  'yellow', 'yes', 'yield', 'young', 'your', 'youth', 'zebra', 'zenith',
  'zero', 'zest', 'zigzag', 'zinc', 'zipper', 'zodiac', 'zone', 'zoom',
];

function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generates an adaptive typing drill passage specifically weighted to exercise
 * the user's identified weak keys while maintaining natural English word rhythm.
 */
export function generateWeakKeyDrillPassage(
  weakKeys: string[],
  targetWordCount: number = 25
): string {
  const normalizedLetters = Array.from(
    new Set(
      weakKeys
        .map((k) => k.toLowerCase().trim())
        .filter((k) => k.length === 1 && /^[a-z0-9]$/.test(k))
    )
  );

  const normalizedSymbols = Array.from(
    new Set(
      weakKeys
        .map((k) => k.toLowerCase().trim())
        .filter((k) => k.length === 1 && /^[.,;'!?/-]$/.test(k))
    )
  );

  // If no weak keys specified, return a diverse pangram-focused balanced drill
  if (normalizedLetters.length === 0 && normalizedSymbols.length === 0) {
    return 'the quick brown fox jumps over the lazy dog while five boxing wizards jump quickly across twenty five pack of red foxes';
  }

  const allWords = Array.from(
    new Set([
      ...WORD_LIST_BEGINNER,
      ...WORD_LIST_INTERMEDIATE,
      ...WORD_LIST_ADVANCED.filter((w) => !w.includes('-')),
      ...EXTRA_DRILL_WORDS,
    ])
  );

  // Use letter drill targets (or fallback letters if only punctuation symbols were weak)
  const targetChars =
    normalizedLetters.length > 0 ? normalizedLetters : ['e', 'a', 's', 't'];

  // Bucket words per target key, prioritizing words containing multiple weak keys
  const bucketsByChar = new Map<string, string[]>();
  for (const ch of targetChars) {
    const matching = shuffleArray(allWords.filter((word) => word.includes(ch)));
    if (normalizedLetters.length > 1) {
      // Slightly bubble multi-weak-key words up while preserving variety
      const shuffledScored = matching.sort((a, b) => {
        const scoreA = normalizedLetters.reduce((acc, k) => acc + (a.includes(k) ? 1 : 0), 0);
        const scoreB = normalizedLetters.reduce((acc, k) => acc + (b.includes(k) ? 1 : 0), 0);
        if (scoreB !== scoreA && Math.random() < 0.7) {
          return scoreB - scoreA;
        }
        return 0;
      });
      bucketsByChar.set(ch, shuffledScored);
    } else {
      bucketsByChar.set(ch, matching);
    }
  }

  const allTargetedPool = shuffleArray(
    allWords.filter((word) => targetChars.some((ch) => word.includes(ch)))
  );
  const fallbackPool = allTargetedPool.length > 0 ? allTargetedPool : shuffleArray(allWords);

  const selectedWords: string[] = [];

  for (let i = 0; i < targetWordCount; i++) {
    const currentChar = targetChars[i % targetChars.length];
    const bucket = bucketsByChar.get(currentChar) || [];

    // Pick a word containing currentChar while avoiding repeating recent words
    let chosen = bucket.find((w) => !selectedWords.slice(-5).includes(w));
    if (!chosen && bucket.length > 0) {
      chosen = bucket[Math.floor(Math.random() * bucket.length)];
    }
    if (!chosen) {
      chosen =
        fallbackPool.find((w) => !selectedWords.slice(-4).includes(w)) ||
        fallbackPool[i % fallbackPool.length];
    }

    // Attach weak punctuation marks naturally every few words when punctuation is weak
    if (normalizedSymbols.length > 0 && i > 0 && i % 3 === 0) {
      const sym = normalizedSymbols[(i / 3 - 1) % normalizedSymbols.length];
      chosen = sym === "'" ? `${chosen.slice(0, Math.max(1, chosen.length - 1))}'s` : `${chosen}${sym}`;
    }

    selectedWords.push(chosen);
  }

  return selectedWords.slice(0, targetWordCount).join(' ');
}
