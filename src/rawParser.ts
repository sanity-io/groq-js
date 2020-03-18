class Step {
  public token: any
  public position: any
  public nextFrames: any
  public acceptedContexts: any
  public callers: any

  constructor(token: any, position: any) {
    this.token = token
    this.position = position
    this.nextFrames = []
    this.acceptedContexts = []
    this.callers = {}
  }

  hasNextFrames() {
    return this.nextFrames.length > 0
  }

  addNextFrame(frame: Frame) {
    this.nextFrames.push(frame)
  }

  wasAccepted() {
    return this.acceptedContexts.length > 0
  }

  addAccept(context: Context) {
    this.acceptedContexts.push(context)
  }

  addMark(name: string, context: Context, nextState: State) {
    const mark = {
      type: 'mark',
      name: name,
      position: this.position
    }
    var marks = context.marks
      ? {
          type: 'concat',
          left: context.marks,
          right: mark
        }
      : mark
    var nextContext = new Context(context.caller, marks)
    var nextFrame = new Frame(nextContext)
    if (nextState.p) {
      nextState.p(this, nextFrame)
    }
    addNextFrame(this, nextFrame)
  }

  startCall(ruleId: string) {
    var caller = this.callers[ruleId]

    if (!caller) {
      caller = new Caller()
      this.callers[ruleId] = caller
      var callContext = new Context(caller, null)
      var callFrame = new Frame(callContext)
      var states = ruleInitialStates[ruleId]
      for (var i = 0; i < states.length; i++) {
        var state = states[i]
        if (state.p) {
          state.p(this, callFrame)
        }
      }
      addNextFrame(this, callFrame)
    }

    return caller
  }

  returnCall(_: string, frame: Frame) {
    // TODO: Implement proper grouping
    var caller = frame.context.caller
    var returns = caller.returns
    for (var i = 0; i < returns.length; i++) {
      var ret = returns[i]
      var callerContext = ret[0]
      var state = ret[1]

      var leftMarks = callerContext.marks
      var rightMarks = frame.context.marks
      var marks =
        leftMarks && rightMarks
          ? {
              type: 'concat',
              left: callerContext.marks,
              right: frame.context.marks
            }
          : leftMarks || rightMarks

      var context = new Context(callerContext.caller, marks)
      var nextFrame = new Frame(context)
      state.p(this, nextFrame)
      addNextFrame(this, nextFrame)
    }
  }
}

class Caller {
  public returns: any[] = []

  addReturn(context: Context, nextState: State) {
    this.returns.push([context, nextState])
  }
}

class Context {
  public caller: any
  public marks: any

  constructor(caller: any, marks: any) {
    this.caller = caller
    this.marks = marks
  }
}

class Frame {
  public context: any
  public nextStates: any[]

  constructor(context: Context) {
    this.context = context
    this.nextStates = []
  }

  addNextState(state: State) {
    this.nextStates.push(state)
  }

  eachNextState(fn: (state: State) => void) {
    this.nextStates.forEach(fn)
  }

  hasNextStates() {
    return this.nextStates.length > 0
  }

  copy() {
    return new Frame(this.context)
  }
}

function processToken(token: any, position: any, frames: Frame[]) {
  var step = new Step(token, position)
  for (var i = 0; i < frames.length; i++) {
    var frame = frames[i]
    processFrame(step, frame)
  }
  return step
}

function processFrame(step: Step, frame: Frame) {
  var newFrame = frame.copy()
  frame.eachNextState(function(state) {
    if (state.p) {
      state.p(step, newFrame)
    }
  })
  addNextFrame(step, newFrame)
}

function addNextFrame(step: Step, frame: Frame) {
  if (frame.hasNextStates()) {
    step.addNextFrame(frame)
  }
}

export function recognize(input: string) {
  var frames = initialFrames

  var i = 0
  for (; i < input.length; i++) {
    var token = input.charCodeAt(i)
    var step = processToken(token, i, frames)
    if (!step.hasNextFrames()) return false
    frames = step.nextFrames
  }

  step = processToken(null, i, frames)
  return step.wasAccepted()
}

function flattenMarks(marks: any) {
  if (!marks) return []

  var queue = [marks]
  var result = []

  while (queue.length) {
    var m = queue.shift()
    if (m.type === 'concat') {
      queue.unshift(m.left, m.right)
    } else if (m.type === 'mark') {
      result.push(m)
    } else {
      throw new Error('unknown mark type: ' + m.type)
    }
  }

  return result
}

export function parse(input: string) {
  var frames = initialFrames

  var i = 0
  for (; i < input.length; i++) {
    var token = input.charCodeAt(i)
    var step = processToken(token, i, frames)
    if (!step.hasNextFrames()) {
      return {type: 'error', position: i}
    }
    frames = step.nextFrames
  }

  step = processToken(null, i, frames)

  if (!step.wasAccepted()) {
    return {type: 'error', position: i}
  }

  var ctx = step.acceptedContexts[0]
  var marks = flattenMarks(ctx.marks)

  return {
    type: 'success',
    marks: marks
  }
}

interface State {
  id?: number
  p?: (step: Step, frame: Frame) => void
}

const states: {[key: string]: State} = {
  s0: {},
  s1: {},
  s2: {},
  s3: {},
  s4: {},
  s5: {},
  s6: {},
  s7: {},
  s8: {},
  s9: {},
  s10: {},
  s11: {},
  s12: {},
  s13: {},
  s14: {},
  s15: {},
  s16: {},
  s17: {},
  s18: {},
  s19: {},
  s20: {},
  s21: {},
  s22: {},
  s23: {},
  s24: {},
  s25: {},
  s26: {},
  s27: {},
  s28: {},
  s29: {},
  s30: {},
  s31: {},
  s32: {},
  s33: {},
  s34: {},
  s35: {},
  s36: {},
  s37: {},
  s38: {},
  s39: {},
  s40: {},
  s41: {},
  s42: {},
  s43: {},
  s44: {},
  s45: {},
  s46: {},
  s47: {},
  s48: {},
  s49: {},
  s50: {},
  s51: {},
  s52: {},
  s53: {},
  s54: {},
  s55: {},
  s56: {},
  s57: {},
  s58: {},
  s59: {},
  s60: {},
  s61: {},
  s62: {},
  s63: {},
  s64: {},
  s65: {},
  s66: {},
  s67: {},
  s68: {},
  s69: {},
  s70: {},
  s71: {},
  s72: {},
  s73: {},
  s74: {},
  s75: {},
  s76: {},
  s77: {},
  s78: {},
  s79: {},
  s80: {},
  s81: {},
  s82: {},
  s83: {},
  s84: {},
  s85: {},
  s86: {},
  s87: {},
  s88: {},
  s89: {},
  s90: {},
  s91: {},
  s92: {},
  s93: {},
  s94: {},
  s95: {},
  s96: {},
  s97: {},
  s98: {},
  s99: {},
  s100: {},
  s101: {},
  s102: {},
  s103: {},
  s104: {},
  s105: {},
  s106: {},
  s107: {},
  s108: {},
  s109: {},
  s110: {},
  s111: {},
  s112: {},
  s113: {},
  s114: {},
  s115: {},
  s116: {},
  s117: {},
  s118: {},
  s119: {},
  s120: {},
  s121: {},
  s122: {},
  s123: {},
  s124: {},
  s125: {},
  s126: {},
  s127: {},
  s128: {},
  s129: {},
  s130: {},
  s131: {},
  s132: {},
  s133: {},
  s134: {},
  s135: {},
  s136: {},
  s137: {},
  s138: {},
  s139: {},
  s140: {},
  s141: {},
  s142: {},
  s143: {},
  s144: {},
  s145: {},
  s146: {},
  s147: {},
  s148: {},
  s149: {},
  s150: {},
  s151: {},
  s152: {},
  s153: {},
  s154: {},
  s155: {},
  s156: {},
  s157: {},
  s158: {},
  s159: {},
  s160: {},
  s161: {},
  s162: {},
  s163: {},
  s164: {},
  s165: {},
  s166: {},
  s167: {},
  s168: {},
  s169: {},
  s170: {},
  s171: {},
  s172: {},
  s173: {},
  s174: {},
  s175: {},
  s176: {},
  s177: {},
  s178: {},
  s179: {},
  s180: {},
  s181: {},
  s182: {},
  s183: {},
  s184: {},
  s185: {},
  s186: {},
  s187: {},
  s188: {},
  s189: {},
  s190: {},
  s191: {},
  s192: {},
  s193: {},
  s194: {},
  s195: {},
  s196: {},
  s197: {},
  s198: {},
  s199: {},
  s200: {},
  s201: {},
  s202: {},
  s203: {},
  s204: {},
  s205: {},
  s206: {},
  s207: {},
  s208: {},
  s209: {},
  s210: {},
  s211: {},
  s212: {},
  s213: {},
  s214: {},
  s215: {},
  s216: {},
  s217: {},
  s218: {},
  s219: {},
  s220: {},
  s221: {},
  s222: {},
  s223: {},
  s224: {},
  s225: {},
  s226: {},
  s227: {},
  s228: {},
  s229: {},
  s230: {},
  s231: {},
  s232: {},
  s233: {},
  s234: {},
  s235: {},
  s236: {},
  s237: {},
  s238: {},
  s239: {},
  s240: {},
  s241: {},
  s242: {},
  s243: {},
  s244: {},
  s245: {},
  s246: {},
  s247: {},
  s248: {},
  s249: {},
  s250: {},
  s251: {},
  s252: {},
  s253: {},
  s254: {},
  s255: {},
  s256: {},
  s257: {},
  s258: {},
  s259: {},
  s260: {},
  s261: {},
  s262: {},
  s263: {},
  s264: {},
  s265: {},
  s266: {},
  s267: {},
  s268: {},
  s269: {},
  s270: {},
  s271: {},
  s272: {},
  s273: {},
  s274: {},
  s275: {},
  s276: {},
  s277: {},
  s278: {},
  s279: {},
  s280: {},
  s281: {},
  s282: {},
  s283: {},
  s284: {},
  s285: {},
  s286: {},
  s287: {},
  s288: {},
  s289: {},
  s290: {},
  s291: {},
  s292: {},
  s293: {},
  s294: {},
  s295: {},
  s296: {},
  s297: {},
  s298: {},
  s299: {},
  s300: {},
  s301: {},
  s302: {},
  s303: {},
  s304: {},
  s305: {},
  s306: {},
  s307: {},
  s308: {},
  s309: {},
  s310: {},
  s311: {},
  s312: {},
  s313: {},
  s314: {},
  s315: {},
  s316: {},
  s317: {},
  s318: {},
  s319: {},
  s320: {},
  s321: {},
  s322: {},
  s323: {},
  s324: {},
  s325: {},
  s326: {},
  s327: {},
  s328: {},
  s329: {},
  s330: {},
  s331: {},
  s332: {},
  s333: {},
  s334: {},
  s335: {},
  s336: {},
  s337: {},
  s338: {},
  s339: {},
  s340: {},
  s341: {},
  s342: {},
  s343: {},
  s344: {},
  s345: {},
  s346: {},
  s347: {},
  s348: {},
  s349: {},
  s350: {},
  s351: {},
  s352: {},
  s353: {},
  s354: {},
  s355: {},
  s356: {},
  s357: {},
  s358: {},
  s359: {},
  s360: {},
  s361: {},
  s362: {},
  s363: {},
  s364: {},
  s365: {},
  s366: {},
  s367: {},
  s368: {},
  s369: {},
  s370: {},
  s371: {},
  s372: {},
  s373: {},
  s374: {},
  s375: {},
  s376: {},
  s377: {},
  s378: {}
}
states.s0.p = function(step, frame) {
  step.startCall('main').addReturn(frame.context, states.s1)
}
states.s0.id = 0
states.s1.p = function(step, frame) {
  step.addAccept(frame.context)
}
states.s1.id = 1
states.s2.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s3)
  step.startCall('EXPR^1').addReturn(frame.context, states.s4)
}
states.s2.id = 2
states.s3.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s3)
  step.startCall('EXPR^1').addReturn(frame.context, states.s4)
}
states.s3.id = 3
states.s4.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s5)
  step.returnCall('main', frame)
}
states.s4.id = 4
states.s5.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s5)
  step.returnCall('main', frame)
}
states.s5.id = 5
states.s6.p = function(step, frame) {
  var token = step.token
  if (token === 9) {
    frame.addNextState(states.s7)
  }
  if (token === 10) {
    frame.addNextState(states.s8)
  }
  if (token === 11) {
    frame.addNextState(states.s9)
  }
  if (token === 12) {
    frame.addNextState(states.s10)
  }
  if (token === 13) {
    frame.addNextState(states.s11)
  }
  if (token === 32) {
    frame.addNextState(states.s12)
  }
  if (token === 133) {
    frame.addNextState(states.s13)
  }
  if (token === 160) {
    frame.addNextState(states.s14)
  }
}
states.s6.id = 6
states.s7.p = function(step, frame) {
  step.returnCall('SPACE', frame)
}
states.s7.id = 7
states.s8.p = function(step, frame) {
  step.returnCall('SPACE', frame)
}
states.s8.id = 8
states.s9.p = function(step, frame) {
  step.returnCall('SPACE', frame)
}
states.s9.id = 9
states.s10.p = function(step, frame) {
  step.returnCall('SPACE', frame)
}
states.s10.id = 10
states.s11.p = function(step, frame) {
  step.returnCall('SPACE', frame)
}
states.s11.id = 11
states.s12.p = function(step, frame) {
  step.returnCall('SPACE', frame)
}
states.s12.id = 12
states.s13.p = function(step, frame) {
  step.returnCall('SPACE', frame)
}
states.s13.id = 13
states.s14.p = function(step, frame) {
  step.returnCall('SPACE', frame)
}
states.s14.id = 14
states.s15.p = function(step, frame) {
  var token = step.token
  if (token === 47) {
    frame.addNextState(states.s16)
  }
}
states.s15.id = 15
states.s16.p = function(step, frame) {
  var token = step.token
  if (token === 47) {
    frame.addNextState(states.s17)
  }
}
states.s16.id = 16
states.s17.p = function(step, frame) {
  var token = step.token
  if (token <= 9) {
    frame.addNextState(states.s18)
  }
  if (token >= 11) {
    frame.addNextState(states.s19)
  }
}
states.s17.id = 17
states.s18.p = function(step, frame) {
  var token = step.token
  if (token <= 9) {
    frame.addNextState(states.s18)
  }
  if (token >= 11) {
    frame.addNextState(states.s19)
  }
  step.startCall('COMMENT_END').addReturn(frame.context, states.s20)
}
states.s18.id = 18
states.s19.p = function(step, frame) {
  var token = step.token
  if (token <= 9) {
    frame.addNextState(states.s18)
  }
  if (token >= 11) {
    frame.addNextState(states.s19)
  }
  step.startCall('COMMENT_END').addReturn(frame.context, states.s20)
}
states.s19.id = 19
states.s20.p = function(step, frame) {
  step.returnCall('COMMENT', frame)
}
states.s20.id = 20
states.s21.p = function(step, frame) {
  var token = step.token
  if (token === 10) {
    frame.addNextState(states.s22)
  }
}
states.s21.id = 21
states.s22.p = function(step, frame) {
  step.returnCall('COMMENT_END', frame)
}
states.s22.id = 22
states.s23.p = function(step, frame) {
  step.startCall('SPACE').addReturn(frame.context, states.s24)
  step.startCall('COMMENT').addReturn(frame.context, states.s25)
}
states.s23.id = 23
states.s24.p = function(step, frame) {
  step.returnCall('IGN', frame)
}
states.s24.id = 24
states.s25.p = function(step, frame) {
  step.returnCall('IGN', frame)
}
states.s25.id = 25
states.s26.p = function(step, frame) {
  var token = step.token
  if (token === 124) {
    frame.addNextState(states.s27)
  }
}
states.s26.id = 26
states.s27.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s28)
  step.returnCall('PIPE', frame)
}
states.s27.id = 27
states.s28.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s28)
  step.returnCall('PIPE', frame)
}
states.s28.id = 28
states.s29.p = function(step, frame) {
  step.addMark('parent', frame.context, states.s30)
  step.addMark('dblparent', frame.context, states.s31)
}
states.s29.id = 29
states.s30.p = function(step, frame) {
  var token = step.token
  if (token === 94) {
    frame.addNextState(states.s32)
  }
}
states.s30.id = 30
states.s31.p = function(step, frame) {
  step.startCall('PARENT').addReturn(frame.context, states.s33)
}
states.s31.id = 31
states.s32.p = function(step, frame) {
  step.returnCall('PARENT', frame)
}
states.s32.id = 32
states.s33.p = function(step, frame) {
  var token = step.token
  if (token === 46) {
    frame.addNextState(states.s34)
  }
}
states.s33.id = 33
states.s34.p = function(step, frame) {
  var token = step.token
  if (token === 94) {
    frame.addNextState(states.s35)
  }
}
states.s34.id = 34
states.s35.p = function(step, frame) {
  step.returnCall('PARENT', frame)
}
states.s35.id = 35
states.s36.p = function(step, frame) {
  var token = step.token
  if (token >= 97 && token <= 122) {
    frame.addNextState(states.s37)
  }
  if (token >= 65 && token <= 90) {
    frame.addNextState(states.s38)
  }
  if (token === 95) {
    frame.addNextState(states.s39)
  }
}
states.s36.id = 36
states.s37.p = function(step, frame) {
  step.returnCall('IDENT_FST', frame)
}
states.s37.id = 37
states.s38.p = function(step, frame) {
  step.returnCall('IDENT_FST', frame)
}
states.s38.id = 38
states.s39.p = function(step, frame) {
  step.returnCall('IDENT_FST', frame)
}
states.s39.id = 39
states.s40.p = function(step, frame) {
  var token = step.token
  step.startCall('IDENT_FST').addReturn(frame.context, states.s41)
  if (token >= 48 && token <= 57) {
    frame.addNextState(states.s42)
  }
}
states.s40.id = 40
states.s41.p = function(step, frame) {
  step.returnCall('IDENT_REST', frame)
}
states.s41.id = 41
states.s42.p = function(step, frame) {
  step.returnCall('IDENT_REST', frame)
}
states.s42.id = 42
states.s43.p = function(step, frame) {
  step.startCall('IDENT_FST').addReturn(frame.context, states.s44)
}
states.s43.id = 43
states.s44.p = function(step, frame) {
  var token = step.token
  step.startCall('IDENT_REST').addReturn(frame.context, states.s45)
  if ((token <= 96 || token >= 123) && (token <= 64 || token >= 91) && (token <= 47 || token >= 58))
    step.returnCall('IDENT', frame)
}
states.s44.id = 44
states.s45.p = function(step, frame) {
  var token = step.token
  step.startCall('IDENT_REST').addReturn(frame.context, states.s45)
  if ((token <= 96 || token >= 123) && (token <= 64 || token >= 91) && (token <= 47 || token >= 58))
    step.returnCall('IDENT', frame)
}
states.s45.id = 45
states.s46.p = function(step, frame) {
  var token = step.token
  if (token === 42) {
    frame.addNextState(states.s47)
  }
}
states.s46.id = 46
states.s47.p = function(step, frame) {
  var token = step.token
  if (token <= 41 || token >= 43) step.returnCall('STAR', frame)
}
states.s47.id = 47
states.s48.p = function(step, frame) {
  var token = step.token
  if (token === 61) {
    frame.addNextState(states.s49)
  }
  if (token === 33) {
    frame.addNextState(states.s50)
  }
  if (token === 62) {
    frame.addNextState(states.s51)
  }
  if (token === 62) {
    frame.addNextState(states.s52)
  }
  if (token === 60) {
    frame.addNextState(states.s53)
  }
  if (token === 60) {
    frame.addNextState(states.s54)
  }
  if (token === 105) {
    frame.addNextState(states.s55)
  }
  if (token === 109) {
    frame.addNextState(states.s56)
  }
}
states.s48.id = 48
states.s49.p = function(step, frame) {
  var token = step.token
  if (token === 61) {
    frame.addNextState(states.s57)
  }
}
states.s49.id = 49
states.s50.p = function(step, frame) {
  var token = step.token
  if (token === 61) {
    frame.addNextState(states.s58)
  }
}
states.s50.id = 50
states.s51.p = function(step, frame) {
  var token = step.token
  if (token === 61) {
    frame.addNextState(states.s59)
  }
}
states.s51.id = 51
states.s52.p = function(step, frame) {
  step.returnCall('COMP_OP', frame)
}
states.s52.id = 52
states.s53.p = function(step, frame) {
  var token = step.token
  if (token === 61) {
    frame.addNextState(states.s60)
  }
}
states.s53.id = 53
states.s54.p = function(step, frame) {
  step.returnCall('COMP_OP', frame)
}
states.s54.id = 54
states.s55.p = function(step, frame) {
  var token = step.token
  if (token === 110) {
    frame.addNextState(states.s61)
  }
}
states.s55.id = 55
states.s56.p = function(step, frame) {
  var token = step.token
  if (token === 97) {
    frame.addNextState(states.s62)
  }
}
states.s56.id = 56
states.s57.p = function(step, frame) {
  step.returnCall('COMP_OP', frame)
}
states.s57.id = 57
states.s58.p = function(step, frame) {
  step.returnCall('COMP_OP', frame)
}
states.s58.id = 58
states.s59.p = function(step, frame) {
  step.returnCall('COMP_OP', frame)
}
states.s59.id = 59
states.s60.p = function(step, frame) {
  step.returnCall('COMP_OP', frame)
}
states.s60.id = 60
states.s61.p = function(step, frame) {
  step.returnCall('COMP_OP', frame)
}
states.s61.id = 61
states.s62.p = function(step, frame) {
  var token = step.token
  if (token === 116) {
    frame.addNextState(states.s63)
  }
}
states.s62.id = 62
states.s63.p = function(step, frame) {
  var token = step.token
  if (token === 99) {
    frame.addNextState(states.s64)
  }
}
states.s63.id = 63
states.s64.p = function(step, frame) {
  var token = step.token
  if (token === 104) {
    frame.addNextState(states.s65)
  }
}
states.s64.id = 64
states.s65.p = function(step, frame) {
  step.returnCall('COMP_OP', frame)
}
states.s65.id = 65
states.s66.p = function(step, frame) {
  step.addMark('func_call', frame.context, states.s67)
}
states.s66.id = 66
states.s67.p = function(step, frame) {
  step.startCall('IDENT').addReturn(frame.context, states.s68)
}
states.s67.id = 67
states.s68.p = function(step, frame) {
  step.addMark('func_name_end', frame.context, states.s69)
}
states.s68.id = 68
states.s69.p = function(step, frame) {
  var token = step.token
  if (token === 40) {
    frame.addNextState(states.s70)
  }
}
states.s69.id = 69
states.s70.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s71)
  step.startCall('FUNC_ARGS').addReturn(frame.context, states.s72)
  step.addMark('func_args_end', frame.context, states.s73)
}
states.s70.id = 70
states.s71.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s71)
  step.startCall('FUNC_ARGS').addReturn(frame.context, states.s72)
  step.addMark('func_args_end', frame.context, states.s73)
}
states.s71.id = 71
states.s72.p = function(step, frame) {
  step.addMark('func_args_end', frame.context, states.s73)
}
states.s72.id = 72
states.s73.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s74)
  if (token === 41) {
    frame.addNextState(states.s75)
  }
}
states.s73.id = 73
states.s74.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s74)
  if (token === 41) {
    frame.addNextState(states.s75)
  }
}
states.s74.id = 74
states.s75.p = function(step, frame) {
  step.returnCall('FUNC_CALL', frame)
}
states.s75.id = 75
states.s76.p = function(step, frame) {
  step.startCall('EXPR^1').addReturn(frame.context, states.s77)
}
states.s76.id = 76
states.s77.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s78)
  if (token === 44) {
    frame.addNextState(states.s80)
  }
  step.returnCall('FUNC_ARGS', frame)
}
states.s77.id = 77
states.s78.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s78)
  if (token === 44) {
    frame.addNextState(states.s80)
  }
  step.returnCall('FUNC_ARGS', frame)
}
states.s78.id = 78
states.s79.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s79)
  step.startCall('EXPR^1').addReturn(frame.context, states.s81)
}
states.s79.id = 79
states.s80.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s79)
  step.startCall('EXPR^1').addReturn(frame.context, states.s81)
}
states.s80.id = 80
states.s81.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s82)
  if (token === 44) {
    frame.addNextState(states.s80)
  }
  step.returnCall('FUNC_ARGS', frame)
}
states.s81.id = 81
states.s82.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s82)
  if (token === 44) {
    frame.addNextState(states.s80)
  }
  step.returnCall('FUNC_ARGS', frame)
}
states.s82.id = 82
states.s83.p = function(step, frame) {
  step.addMark('sci', frame.context, states.s84)
  step.addMark('float', frame.context, states.s85)
  step.addMark('integer', frame.context, states.s86)
}
states.s83.id = 83
states.s84.p = function(step, frame) {
  step.startCall('DIGIT').addReturn(frame.context, states.s87)
}
states.s84.id = 84
states.s85.p = function(step, frame) {
  step.startCall('DIGIT').addReturn(frame.context, states.s95)
}
states.s85.id = 85
states.s86.p = function(step, frame) {
  step.startCall('DIGIT').addReturn(frame.context, states.s99)
}
states.s86.id = 86
states.s87.p = function(step, frame) {
  var token = step.token
  step.startCall('DIGIT').addReturn(frame.context, states.s87)
  if (token === 46) {
    frame.addNextState(states.s89)
  }
  if (token === 101) {
    frame.addNextState(states.s90)
  }
  if (token === 69) {
    frame.addNextState(states.s91)
  }
}
states.s87.id = 87
states.s88.p = function(step, frame) {
  var token = step.token
  step.startCall('DIGIT').addReturn(frame.context, states.s88)
  if (token === 101) {
    frame.addNextState(states.s90)
  }
  if (token === 69) {
    frame.addNextState(states.s91)
  }
}
states.s88.id = 88
states.s89.p = function(step, frame) {
  step.startCall('DIGIT').addReturn(frame.context, states.s88)
}
states.s89.id = 89
states.s90.p = function(step, frame) {
  step.startCall('SIGN').addReturn(frame.context, states.s92)
  step.startCall('DIGIT').addReturn(frame.context, states.s93)
}
states.s90.id = 90
states.s91.p = function(step, frame) {
  step.startCall('SIGN').addReturn(frame.context, states.s92)
  step.startCall('DIGIT').addReturn(frame.context, states.s93)
}
states.s91.id = 91
states.s92.p = function(step, frame) {
  step.startCall('DIGIT').addReturn(frame.context, states.s93)
}
states.s92.id = 92
states.s93.p = function(step, frame) {
  step.startCall('DIGIT').addReturn(frame.context, states.s93)
  step.addMark('sci_end', frame.context, states.s94)
}
states.s93.id = 93
states.s94.p = function(step, frame) {
  step.returnCall('NUMBER', frame)
}
states.s94.id = 94
states.s95.p = function(step, frame) {
  var token = step.token
  step.startCall('DIGIT').addReturn(frame.context, states.s95)
  if (token === 46) {
    frame.addNextState(states.s96)
  }
}
states.s95.id = 95
states.s96.p = function(step, frame) {
  step.startCall('DIGIT').addReturn(frame.context, states.s97)
}
states.s96.id = 96
states.s97.p = function(step, frame) {
  step.startCall('DIGIT').addReturn(frame.context, states.s97)
  step.addMark('float_end', frame.context, states.s98)
}
states.s97.id = 97
states.s98.p = function(step, frame) {
  step.returnCall('NUMBER', frame)
}
states.s98.id = 98
states.s99.p = function(step, frame) {
  step.startCall('DIGIT').addReturn(frame.context, states.s99)
  step.addMark('integer_end', frame.context, states.s100)
}
states.s99.id = 99
states.s100.p = function(step, frame) {
  step.returnCall('NUMBER', frame)
}
states.s100.id = 100
states.s101.p = function(step, frame) {
  var token = step.token
  if (token >= 48 && token <= 57) {
    frame.addNextState(states.s102)
  }
}
states.s101.id = 101
states.s102.p = function(step, frame) {
  step.returnCall('DIGIT', frame)
}
states.s102.id = 102
states.s103.p = function(step, frame) {
  var token = step.token
  if (token === 43) {
    frame.addNextState(states.s104)
  }
  if (token === 45) {
    frame.addNextState(states.s105)
  }
}
states.s103.id = 103
states.s104.p = function(step, frame) {
  step.returnCall('SIGN', frame)
}
states.s104.id = 104
states.s105.p = function(step, frame) {
  step.returnCall('SIGN', frame)
}
states.s105.id = 105
states.s106.p = function(step, frame) {
  var token = step.token
  if (token === 34) {
    frame.addNextState(states.s107)
  }
  if (token === 39) {
    frame.addNextState(states.s108)
  }
}
states.s106.id = 106
states.s107.p = function(step, frame) {
  step.addMark('str_begin', frame.context, states.s109)
}
states.s107.id = 107
states.s108.p = function(step, frame) {
  step.addMark('str_begin', frame.context, states.s113)
}
states.s108.id = 108
states.s109.p = function(step, frame) {
  step.startCall('DSTRING_CHAR').addReturn(frame.context, states.s110)
  step.addMark('str_end', frame.context, states.s111)
}
states.s109.id = 109
states.s110.p = function(step, frame) {
  step.startCall('DSTRING_CHAR').addReturn(frame.context, states.s110)
  step.addMark('str_end', frame.context, states.s111)
}
states.s110.id = 110
states.s111.p = function(step, frame) {
  var token = step.token
  if (token === 34) {
    frame.addNextState(states.s112)
  }
}
states.s111.id = 111
states.s112.p = function(step, frame) {
  step.returnCall('STRING', frame)
}
states.s112.id = 112
states.s113.p = function(step, frame) {
  step.startCall('SSTRING_CHAR').addReturn(frame.context, states.s114)
  step.addMark('str_end', frame.context, states.s115)
}
states.s113.id = 113
states.s114.p = function(step, frame) {
  step.startCall('SSTRING_CHAR').addReturn(frame.context, states.s114)
  step.addMark('str_end', frame.context, states.s115)
}
states.s114.id = 114
states.s115.p = function(step, frame) {
  var token = step.token
  if (token === 39) {
    frame.addNextState(states.s116)
  }
}
states.s115.id = 115
states.s116.p = function(step, frame) {
  step.returnCall('STRING', frame)
}
states.s116.id = 116
states.s117.p = function(step, frame) {
  var token = step.token
  if (token === 92) {
    frame.addNextState(states.s118)
  }
  if ((token <= 33 || token >= 35) && (token <= 91 || token >= 93)) {
    frame.addNextState(states.s119)
  }
}
states.s117.id = 117
states.s118.p = function(_, frame) {
  frame.addNextState(states.s120)
}
states.s118.id = 118
states.s119.p = function(step, frame) {
  step.returnCall('DSTRING_CHAR', frame)
}
states.s119.id = 119
states.s120.p = function(step, frame) {
  step.returnCall('DSTRING_CHAR', frame)
}
states.s120.id = 120
states.s121.p = function(step, frame) {
  var token = step.token
  if (token === 92) {
    frame.addNextState(states.s122)
  }
  if ((token <= 38 || token >= 40) && (token <= 91 || token >= 93)) {
    frame.addNextState(states.s123)
  }
}
states.s121.id = 121
states.s122.p = function(_, frame) {
  frame.addNextState(states.s124)
}
states.s122.id = 122
states.s123.p = function(step, frame) {
  step.returnCall('SSTRING_CHAR', frame)
}
states.s123.id = 123
states.s124.p = function(step, frame) {
  step.returnCall('SSTRING_CHAR', frame)
}
states.s124.id = 124
states.s125.p = function(step, frame) {
  step.addMark('array', frame.context, states.s126)
}
states.s125.id = 125
states.s126.p = function(step, frame) {
  var token = step.token
  if (token === 91) {
    frame.addNextState(states.s127)
  }
}
states.s126.id = 126
states.s127.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s128)
  step.startCall('ARRAY_ELEMENT').addReturn(frame.context, states.s130)
  if (token === 93) {
    frame.addNextState(states.s137)
  }
}
states.s127.id = 127
states.s128.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s128)
  step.startCall('ARRAY_ELEMENT').addReturn(frame.context, states.s130)
  if (token === 93) {
    frame.addNextState(states.s137)
  }
}
states.s128.id = 128
states.s129.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s129)
  if (token === 44) {
    frame.addNextState(states.s132)
  }
  if (token === 44) {
    frame.addNextState(states.s136)
  }
  if (token === 93) {
    frame.addNextState(states.s137)
  }
}
states.s129.id = 129
states.s130.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s129)
  if (token === 44) {
    frame.addNextState(states.s132)
  }
  if (token === 44) {
    frame.addNextState(states.s136)
  }
  if (token === 93) {
    frame.addNextState(states.s137)
  }
}
states.s130.id = 130
states.s131.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s131)
  step.startCall('ARRAY_ELEMENT').addReturn(frame.context, states.s133)
}
states.s131.id = 131
states.s132.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s131)
  step.startCall('ARRAY_ELEMENT').addReturn(frame.context, states.s133)
}
states.s132.id = 132
states.s133.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s134)
  if (token === 44) {
    frame.addNextState(states.s132)
  }
  if (token === 44) {
    frame.addNextState(states.s136)
  }
  if (token === 93) {
    frame.addNextState(states.s137)
  }
}
states.s133.id = 133
states.s134.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s134)
  if (token === 44) {
    frame.addNextState(states.s132)
  }
  if (token === 44) {
    frame.addNextState(states.s136)
  }
  if (token === 93) {
    frame.addNextState(states.s137)
  }
}
states.s134.id = 134
states.s135.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s135)
  if (token === 93) {
    frame.addNextState(states.s137)
  }
}
states.s135.id = 135
states.s136.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s135)
  if (token === 93) {
    frame.addNextState(states.s137)
  }
}
states.s136.id = 136
states.s137.p = function(step, frame) {
  step.addMark('array_end', frame.context, states.s138)
}
states.s137.id = 137
states.s138.p = function(step, frame) {
  step.returnCall('ARRAY', frame)
}
states.s138.id = 138
states.s139.p = function(step, frame) {
  step.addMark('array_splat', frame.context, states.s140)
  step.startCall('EXPR^1').addReturn(frame.context, states.s141)
}
states.s139.id = 139
states.s140.p = function(step, frame) {
  var token = step.token
  if (token === 46) {
    frame.addNextState(states.s142)
  }
}
states.s140.id = 140
states.s141.p = function(step, frame) {
  step.returnCall('ARRAY_ELEMENT', frame)
}
states.s141.id = 141
states.s142.p = function(step, frame) {
  var token = step.token
  if (token === 46) {
    frame.addNextState(states.s143)
  }
}
states.s142.id = 142
states.s143.p = function(step, frame) {
  var token = step.token
  if (token === 46) {
    frame.addNextState(states.s144)
  }
}
states.s143.id = 143
states.s144.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s145)
  step.startCall('EXPR^1').addReturn(frame.context, states.s141)
}
states.s144.id = 144
states.s145.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s145)
  step.startCall('EXPR^1').addReturn(frame.context, states.s141)
}
states.s145.id = 145
states.s146.p = function(step, frame) {
  step.addMark('object', frame.context, states.s147)
}
states.s146.id = 146
states.s147.p = function(step, frame) {
  var token = step.token
  if (token === 123) {
    frame.addNextState(states.s148)
  }
}
states.s147.id = 147
states.s148.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s149)
  step.startCall('OBJECT_PAIR').addReturn(frame.context, states.s151)
  if (token === 125) {
    frame.addNextState(states.s158)
  }
}
states.s148.id = 148
states.s149.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s149)
  step.startCall('OBJECT_PAIR').addReturn(frame.context, states.s151)
  if (token === 125) {
    frame.addNextState(states.s158)
  }
}
states.s149.id = 149
states.s150.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s150)
  if (token === 44) {
    frame.addNextState(states.s153)
  }
  if (token === 44) {
    frame.addNextState(states.s157)
  }
  if (token === 125) {
    frame.addNextState(states.s158)
  }
}
states.s150.id = 150
states.s151.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s150)
  if (token === 44) {
    frame.addNextState(states.s153)
  }
  if (token === 44) {
    frame.addNextState(states.s157)
  }
  if (token === 125) {
    frame.addNextState(states.s158)
  }
}
states.s151.id = 151
states.s152.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s152)
  step.startCall('OBJECT_PAIR').addReturn(frame.context, states.s154)
}
states.s152.id = 152
states.s153.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s152)
  step.startCall('OBJECT_PAIR').addReturn(frame.context, states.s154)
}
states.s153.id = 153
states.s154.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s155)
  if (token === 44) {
    frame.addNextState(states.s153)
  }
  if (token === 44) {
    frame.addNextState(states.s157)
  }
  if (token === 125) {
    frame.addNextState(states.s158)
  }
}
states.s154.id = 154
states.s155.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s155)
  if (token === 44) {
    frame.addNextState(states.s153)
  }
  if (token === 44) {
    frame.addNextState(states.s157)
  }
  if (token === 125) {
    frame.addNextState(states.s158)
  }
}
states.s155.id = 155
states.s156.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s156)
  if (token === 125) {
    frame.addNextState(states.s158)
  }
}
states.s156.id = 156
states.s157.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s156)
  if (token === 125) {
    frame.addNextState(states.s158)
  }
}
states.s157.id = 157
states.s158.p = function(step, frame) {
  step.addMark('object_end', frame.context, states.s159)
}
states.s158.id = 158
states.s159.p = function(step, frame) {
  step.returnCall('OBJECT', frame)
}
states.s159.id = 159
states.s160.p = function(step, frame) {
  step.addMark('object_pair', frame.context, states.s161)
  step.addMark('object_expr', frame.context, states.s162)
  step.addMark('object_splat_this', frame.context, states.s163)
  step.addMark('object_splat', frame.context, states.s164)
}
states.s160.id = 160
states.s161.p = function(step, frame) {
  step.startCall('STRING').addReturn(frame.context, states.s165)
}
states.s161.id = 161
states.s162.p = function(step, frame) {
  step.startCall('EXPR^1').addReturn(frame.context, states.s170)
}
states.s162.id = 162
states.s163.p = function(step, frame) {
  var token = step.token
  if (token === 46) {
    frame.addNextState(states.s171)
  }
}
states.s163.id = 163
states.s164.p = function(step, frame) {
  var token = step.token
  if (token === 46) {
    frame.addNextState(states.s174)
  }
}
states.s164.id = 164
states.s165.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s166)
  if (token === 58) {
    frame.addNextState(states.s167)
  }
}
states.s165.id = 165
states.s166.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s166)
  if (token === 58) {
    frame.addNextState(states.s167)
  }
}
states.s166.id = 166
states.s167.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s168)
  step.startCall('EXPR^1').addReturn(frame.context, states.s169)
}
states.s167.id = 167
states.s168.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s168)
  step.startCall('EXPR^1').addReturn(frame.context, states.s169)
}
states.s168.id = 168
states.s169.p = function(step, frame) {
  step.returnCall('OBJECT_PAIR', frame)
}
states.s169.id = 169
states.s170.p = function(step, frame) {
  step.returnCall('OBJECT_PAIR', frame)
}
states.s170.id = 170
states.s171.p = function(step, frame) {
  var token = step.token
  if (token === 46) {
    frame.addNextState(states.s172)
  }
}
states.s171.id = 171
states.s172.p = function(step, frame) {
  var token = step.token
  if (token === 46) {
    frame.addNextState(states.s173)
  }
}
states.s172.id = 172
states.s173.p = function(step, frame) {
  step.returnCall('OBJECT_PAIR', frame)
}
states.s173.id = 173
states.s174.p = function(step, frame) {
  var token = step.token
  if (token === 46) {
    frame.addNextState(states.s175)
  }
}
states.s174.id = 174
states.s175.p = function(step, frame) {
  var token = step.token
  if (token === 46) {
    frame.addNextState(states.s176)
  }
}
states.s175.id = 175
states.s176.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s177)
  step.startCall('EXPR^1').addReturn(frame.context, states.s178)
}
states.s176.id = 176
states.s177.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s177)
  step.startCall('EXPR^1').addReturn(frame.context, states.s178)
}
states.s177.id = 177
states.s178.p = function(step, frame) {
  step.returnCall('OBJECT_PAIR', frame)
}
states.s178.id = 178
states.s179.p = function(step, frame) {
  step.addMark('pair', frame.context, states.s180)
  step.startCall('EXPR^2').addReturn(frame.context, states.s181)
}
states.s179.id = 179
states.s180.p = function(step, frame) {
  step.startCall('EXPR^2').addReturn(frame.context, states.s182)
}
states.s180.id = 180
states.s181.p = function(step, frame) {
  step.returnCall('EXPR^1', frame)
}
states.s181.id = 181
states.s182.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s183)
  if (token === 61) {
    frame.addNextState(states.s184)
  }
}
states.s182.id = 182
states.s183.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s183)
  if (token === 61) {
    frame.addNextState(states.s184)
  }
}
states.s183.id = 183
states.s184.p = function(step, frame) {
  var token = step.token
  if (token === 62) {
    frame.addNextState(states.s185)
  }
}
states.s184.id = 184
states.s185.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s186)
  step.startCall('EXPR^2').addReturn(frame.context, states.s187)
}
states.s185.id = 185
states.s186.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s186)
  step.startCall('EXPR^2').addReturn(frame.context, states.s187)
}
states.s186.id = 186
states.s187.p = function(step, frame) {
  step.returnCall('EXPR^1', frame)
}
states.s187.id = 187
states.s188.p = function(step, frame) {
  step.addMark('or', frame.context, states.s189)
  step.startCall('EXPR^3').addReturn(frame.context, states.s190)
}
states.s188.id = 188
states.s189.p = function(step, frame) {
  step.startCall('EXPR^2').addReturn(frame.context, states.s191)
}
states.s189.id = 189
states.s190.p = function(step, frame) {
  step.returnCall('EXPR^2', frame)
}
states.s190.id = 190
states.s191.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s192)
  if (token === 124) {
    frame.addNextState(states.s193)
  }
}
states.s191.id = 191
states.s192.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s192)
  if (token === 124) {
    frame.addNextState(states.s193)
  }
}
states.s192.id = 192
states.s193.p = function(step, frame) {
  var token = step.token
  if (token === 124) {
    frame.addNextState(states.s194)
  }
}
states.s193.id = 193
states.s194.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s195)
  step.startCall('EXPR^3').addReturn(frame.context, states.s196)
}
states.s194.id = 194
states.s195.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s195)
  step.startCall('EXPR^3').addReturn(frame.context, states.s196)
}
states.s195.id = 195
states.s196.p = function(step, frame) {
  step.returnCall('EXPR^2', frame)
}
states.s196.id = 196
states.s197.p = function(step, frame) {
  step.addMark('and', frame.context, states.s198)
  step.startCall('EXPR^4').addReturn(frame.context, states.s199)
}
states.s197.id = 197
states.s198.p = function(step, frame) {
  step.startCall('EXPR^3').addReturn(frame.context, states.s200)
}
states.s198.id = 198
states.s199.p = function(step, frame) {
  step.returnCall('EXPR^3', frame)
}
states.s199.id = 199
states.s200.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s201)
  if (token === 38) {
    frame.addNextState(states.s202)
  }
}
states.s200.id = 200
states.s201.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s201)
  if (token === 38) {
    frame.addNextState(states.s202)
  }
}
states.s201.id = 201
states.s202.p = function(step, frame) {
  var token = step.token
  if (token === 38) {
    frame.addNextState(states.s203)
  }
}
states.s202.id = 202
states.s203.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s204)
  step.startCall('EXPR^4').addReturn(frame.context, states.s205)
}
states.s203.id = 203
states.s204.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s204)
  step.startCall('EXPR^4').addReturn(frame.context, states.s205)
}
states.s204.id = 204
states.s205.p = function(step, frame) {
  step.returnCall('EXPR^3', frame)
}
states.s205.id = 205
states.s206.p = function(step, frame) {
  step.addMark('comp', frame.context, states.s207)
  step.addMark('asc', frame.context, states.s208)
  step.addMark('desc', frame.context, states.s209)
  step.startCall('EXPR^5').addReturn(frame.context, states.s210)
}
states.s206.id = 206
states.s207.p = function(step, frame) {
  step.startCall('EXPR^5').addReturn(frame.context, states.s211)
}
states.s207.id = 207
states.s208.p = function(step, frame) {
  step.startCall('EXPR^4').addReturn(frame.context, states.s218)
}
states.s208.id = 208
states.s209.p = function(step, frame) {
  step.startCall('EXPR^4').addReturn(frame.context, states.s223)
}
states.s209.id = 209
states.s210.p = function(step, frame) {
  step.returnCall('EXPR^4', frame)
}
states.s210.id = 210
states.s211.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s212)
  step.addMark('op', frame.context, states.s213)
}
states.s211.id = 211
states.s212.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s212)
  step.addMark('op', frame.context, states.s213)
}
states.s212.id = 212
states.s213.p = function(step, frame) {
  step.startCall('COMP_OP').addReturn(frame.context, states.s214)
}
states.s213.id = 213
states.s214.p = function(step, frame) {
  step.addMark('end', frame.context, states.s215)
}
states.s214.id = 214
states.s215.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s216)
  step.startCall('EXPR^5').addReturn(frame.context, states.s217)
}
states.s215.id = 215
states.s216.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s216)
  step.startCall('EXPR^5').addReturn(frame.context, states.s217)
}
states.s216.id = 216
states.s217.p = function(step, frame) {
  step.returnCall('EXPR^4', frame)
}
states.s217.id = 217
states.s218.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s219)
  if (token === 97) {
    frame.addNextState(states.s220)
  }
}
states.s218.id = 218
states.s219.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s219)
  if (token === 97) {
    frame.addNextState(states.s220)
  }
}
states.s219.id = 219
states.s220.p = function(step, frame) {
  var token = step.token
  if (token === 115) {
    frame.addNextState(states.s221)
  }
}
states.s220.id = 220
states.s221.p = function(step, frame) {
  var token = step.token
  if (token === 99) {
    frame.addNextState(states.s222)
  }
}
states.s221.id = 221
states.s222.p = function(step, frame) {
  step.returnCall('EXPR^4', frame)
}
states.s222.id = 222
states.s223.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s224)
  if (token === 100) {
    frame.addNextState(states.s225)
  }
}
states.s223.id = 223
states.s224.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s224)
  if (token === 100) {
    frame.addNextState(states.s225)
  }
}
states.s224.id = 224
states.s225.p = function(step, frame) {
  var token = step.token
  if (token === 101) {
    frame.addNextState(states.s226)
  }
}
states.s225.id = 225
states.s226.p = function(step, frame) {
  var token = step.token
  if (token === 115) {
    frame.addNextState(states.s227)
  }
}
states.s226.id = 226
states.s227.p = function(step, frame) {
  var token = step.token
  if (token === 99) {
    frame.addNextState(states.s228)
  }
}
states.s227.id = 227
states.s228.p = function(step, frame) {
  step.returnCall('EXPR^4', frame)
}
states.s228.id = 228
states.s229.p = function(step, frame) {
  step.addMark('inc_range', frame.context, states.s230)
  step.addMark('exc_range', frame.context, states.s231)
  step.startCall('EXPR^6').addReturn(frame.context, states.s232)
}
states.s229.id = 229
states.s230.p = function(step, frame) {
  step.startCall('EXPR^6').addReturn(frame.context, states.s233)
}
states.s230.id = 230
states.s231.p = function(step, frame) {
  step.startCall('EXPR^6').addReturn(frame.context, states.s239)
}
states.s231.id = 231
states.s232.p = function(step, frame) {
  step.returnCall('EXPR^5', frame)
}
states.s232.id = 232
states.s233.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s234)
  if (token === 46) {
    frame.addNextState(states.s235)
  }
}
states.s233.id = 233
states.s234.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s234)
  if (token === 46) {
    frame.addNextState(states.s235)
  }
}
states.s234.id = 234
states.s235.p = function(step, frame) {
  var token = step.token
  if (token === 46) {
    frame.addNextState(states.s236)
  }
}
states.s235.id = 235
states.s236.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s237)
  step.startCall('EXPR^6').addReturn(frame.context, states.s238)
}
states.s236.id = 236
states.s237.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s237)
  step.startCall('EXPR^6').addReturn(frame.context, states.s238)
}
states.s237.id = 237
states.s238.p = function(step, frame) {
  step.returnCall('EXPR^5', frame)
}
states.s238.id = 238
states.s239.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s240)
  if (token === 46) {
    frame.addNextState(states.s241)
  }
}
states.s239.id = 239
states.s240.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s240)
  if (token === 46) {
    frame.addNextState(states.s241)
  }
}
states.s240.id = 240
states.s241.p = function(step, frame) {
  var token = step.token
  if (token === 46) {
    frame.addNextState(states.s242)
  }
}
states.s241.id = 241
states.s242.p = function(step, frame) {
  var token = step.token
  if (token === 46) {
    frame.addNextState(states.s243)
  }
}
states.s242.id = 242
states.s243.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s244)
  step.startCall('EXPR^6').addReturn(frame.context, states.s245)
}
states.s243.id = 243
states.s244.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s244)
  step.startCall('EXPR^6').addReturn(frame.context, states.s245)
}
states.s244.id = 244
states.s245.p = function(step, frame) {
  step.returnCall('EXPR^5', frame)
}
states.s245.id = 245
states.s246.p = function(step, frame) {
  step.addMark('add', frame.context, states.s247)
  step.addMark('sub', frame.context, states.s248)
  step.startCall('EXPR^7').addReturn(frame.context, states.s249)
}
states.s246.id = 246
states.s247.p = function(step, frame) {
  step.startCall('EXPR^6').addReturn(frame.context, states.s250)
}
states.s247.id = 247
states.s248.p = function(step, frame) {
  step.startCall('EXPR^6').addReturn(frame.context, states.s255)
}
states.s248.id = 248
states.s249.p = function(step, frame) {
  step.returnCall('EXPR^6', frame)
}
states.s249.id = 249
states.s250.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s251)
  if (token === 43) {
    frame.addNextState(states.s252)
  }
}
states.s250.id = 250
states.s251.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s251)
  if (token === 43) {
    frame.addNextState(states.s252)
  }
}
states.s251.id = 251
states.s252.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s253)
  step.startCall('EXPR^7').addReturn(frame.context, states.s254)
}
states.s252.id = 252
states.s253.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s253)
  step.startCall('EXPR^7').addReturn(frame.context, states.s254)
}
states.s253.id = 253
states.s254.p = function(step, frame) {
  step.returnCall('EXPR^6', frame)
}
states.s254.id = 254
states.s255.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s256)
  if (token === 45) {
    frame.addNextState(states.s257)
  }
}
states.s255.id = 255
states.s256.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s256)
  if (token === 45) {
    frame.addNextState(states.s257)
  }
}
states.s256.id = 256
states.s257.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s258)
  step.startCall('EXPR^7').addReturn(frame.context, states.s259)
}
states.s257.id = 257
states.s258.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s258)
  step.startCall('EXPR^7').addReturn(frame.context, states.s259)
}
states.s258.id = 258
states.s259.p = function(step, frame) {
  step.returnCall('EXPR^6', frame)
}
states.s259.id = 259
states.s260.p = function(step, frame) {
  step.addMark('mul', frame.context, states.s261)
  step.addMark('div', frame.context, states.s262)
  step.addMark('mod', frame.context, states.s263)
  step.startCall('EXPR^9').addReturn(frame.context, states.s264)
}
states.s260.id = 260
states.s261.p = function(step, frame) {
  step.startCall('EXPR^7').addReturn(frame.context, states.s265)
}
states.s261.id = 261
states.s262.p = function(step, frame) {
  step.startCall('EXPR^7').addReturn(frame.context, states.s270)
}
states.s262.id = 262
states.s263.p = function(step, frame) {
  step.startCall('EXPR^7').addReturn(frame.context, states.s275)
}
states.s263.id = 263
states.s264.p = function(step, frame) {
  step.returnCall('EXPR^7', frame)
}
states.s264.id = 264
states.s265.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s266)
  step.startCall('STAR').addReturn(frame.context, states.s267)
}
states.s265.id = 265
states.s266.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s266)
  step.startCall('STAR').addReturn(frame.context, states.s267)
}
states.s266.id = 266
states.s267.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s268)
  step.startCall('EXPR^9').addReturn(frame.context, states.s269)
}
states.s267.id = 267
states.s268.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s268)
  step.startCall('EXPR^9').addReturn(frame.context, states.s269)
}
states.s268.id = 268
states.s269.p = function(step, frame) {
  step.returnCall('EXPR^7', frame)
}
states.s269.id = 269
states.s270.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s271)
  if (token === 47) {
    frame.addNextState(states.s272)
  }
}
states.s270.id = 270
states.s271.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s271)
  if (token === 47) {
    frame.addNextState(states.s272)
  }
}
states.s271.id = 271
states.s272.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s273)
  step.startCall('EXPR^9').addReturn(frame.context, states.s274)
}
states.s272.id = 272
states.s273.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s273)
  step.startCall('EXPR^9').addReturn(frame.context, states.s274)
}
states.s273.id = 273
states.s274.p = function(step, frame) {
  step.returnCall('EXPR^7', frame)
}
states.s274.id = 274
states.s275.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s276)
  if (token === 37) {
    frame.addNextState(states.s277)
  }
}
states.s275.id = 275
states.s276.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s276)
  if (token === 37) {
    frame.addNextState(states.s277)
  }
}
states.s276.id = 276
states.s277.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s278)
  step.startCall('EXPR^9').addReturn(frame.context, states.s279)
}
states.s277.id = 277
states.s278.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s278)
  step.startCall('EXPR^9').addReturn(frame.context, states.s279)
}
states.s278.id = 278
states.s279.p = function(step, frame) {
  step.returnCall('EXPR^7', frame)
}
states.s279.id = 279
states.s280.p = function(step, frame) {
  step.addMark('pow', frame.context, states.s281)
  step.startCall('EXPR^11').addReturn(frame.context, states.s282)
}
states.s280.id = 280
states.s281.p = function(step, frame) {
  step.startCall('EXPR^11').addReturn(frame.context, states.s283)
}
states.s281.id = 281
states.s282.p = function(step, frame) {
  step.returnCall('EXPR^9', frame)
}
states.s282.id = 282
states.s283.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s284)
  if (token === 42) {
    frame.addNextState(states.s285)
  }
}
states.s283.id = 283
states.s284.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s284)
  if (token === 42) {
    frame.addNextState(states.s285)
  }
}
states.s284.id = 284
states.s285.p = function(step, frame) {
  var token = step.token
  if (token === 42) {
    frame.addNextState(states.s286)
  }
}
states.s285.id = 285
states.s286.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s287)
  step.startCall('EXPR^9').addReturn(frame.context, states.s288)
}
states.s286.id = 286
states.s287.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s287)
  step.startCall('EXPR^9').addReturn(frame.context, states.s288)
}
states.s287.id = 287
states.s288.p = function(step, frame) {
  step.returnCall('EXPR^9', frame)
}
states.s288.id = 288
states.s289.p = function(step, frame) {
  var token = step.token
  step.startCall('NUMBER').addReturn(frame.context, states.s290)
  step.startCall('STRING').addReturn(frame.context, states.s291)
  step.startCall('ARRAY').addReturn(frame.context, states.s292)
  step.startCall('OBJECT').addReturn(frame.context, states.s293)
  step.addMark('star', frame.context, states.s294)
  step.addMark('this', frame.context, states.s295)
  step.startCall('PARENT').addReturn(frame.context, states.s296)
  step.addMark('paren', frame.context, states.s297)
  if (token === 36) {
    frame.addNextState(states.s298)
  }
  step.addMark('ident', frame.context, states.s299)
  step.startCall('FUNC_CALL').addReturn(frame.context, states.s300)
  step.addMark('neg', frame.context, states.s301)
  step.addMark('pos', frame.context, states.s302)
  step.addMark('not', frame.context, states.s303)
  if (token === 105) {
    frame.addNextState(states.s304)
  }
  step.addMark('deref', frame.context, states.s305)
  step.addMark('attr_cond', frame.context, states.s306)
  step.addMark('attr_ident', frame.context, states.s307)
  step.addMark('pipecall', frame.context, states.s308)
  step.addMark('project', frame.context, states.s309)
  step.addMark('filter', frame.context, states.s310)
  step.addMark('arr_expr', frame.context, states.s311)
}
states.s289.id = 289
states.s290.p = function(step, frame) {
  step.returnCall('EXPR^11', frame)
}
states.s290.id = 290
states.s291.p = function(step, frame) {
  step.returnCall('EXPR^11', frame)
}
states.s291.id = 291
states.s292.p = function(step, frame) {
  step.returnCall('EXPR^11', frame)
}
states.s292.id = 292
states.s293.p = function(step, frame) {
  step.returnCall('EXPR^11', frame)
}
states.s293.id = 293
states.s294.p = function(step, frame) {
  step.startCall('STAR').addReturn(frame.context, states.s312)
}
states.s294.id = 294
states.s295.p = function(step, frame) {
  var token = step.token
  if (token === 64) {
    frame.addNextState(states.s313)
  }
}
states.s295.id = 295
states.s296.p = function(step, frame) {
  step.returnCall('EXPR^11', frame)
}
states.s296.id = 296
states.s297.p = function(step, frame) {
  var token = step.token
  if (token === 40) {
    frame.addNextState(states.s314)
  }
}
states.s297.id = 297
states.s298.p = function(step, frame) {
  step.addMark('param', frame.context, states.s319)
}
states.s298.id = 298
states.s299.p = function(step, frame) {
  step.startCall('IDENT').addReturn(frame.context, states.s322)
}
states.s299.id = 299
states.s300.p = function(step, frame) {
  step.returnCall('EXPR^11', frame)
}
states.s300.id = 300
states.s301.p = function(step, frame) {
  var token = step.token
  if (token === 45) {
    frame.addNextState(states.s324)
  }
}
states.s301.id = 301
states.s302.p = function(step, frame) {
  var token = step.token
  if (token === 43) {
    frame.addNextState(states.s327)
  }
}
states.s302.id = 302
states.s303.p = function(step, frame) {
  var token = step.token
  if (token === 33) {
    frame.addNextState(states.s330)
  }
}
states.s303.id = 303
states.s304.p = function(step, frame) {
  var token = step.token
  if (token === 115) {
    frame.addNextState(states.s333)
  }
}
states.s304.id = 304
states.s305.p = function(step, frame) {
  step.startCall('EXPR^11').addReturn(frame.context, states.s336)
}
states.s305.id = 305
states.s306.p = function(step, frame) {
  step.startCall('EXPR^11').addReturn(frame.context, states.s343)
}
states.s306.id = 306
states.s307.p = function(step, frame) {
  step.startCall('EXPR^11').addReturn(frame.context, states.s352)
}
states.s307.id = 307
states.s308.p = function(step, frame) {
  step.startCall('EXPR^11').addReturn(frame.context, states.s358)
}
states.s308.id = 308
states.s309.p = function(step, frame) {
  step.startCall('EXPR^11').addReturn(frame.context, states.s362)
}
states.s309.id = 309
states.s310.p = function(step, frame) {
  step.startCall('EXPR^11').addReturn(frame.context, states.s366)
}
states.s310.id = 310
states.s311.p = function(step, frame) {
  step.startCall('EXPR^11').addReturn(frame.context, states.s374)
}
states.s311.id = 311
states.s312.p = function(step, frame) {
  step.returnCall('EXPR^11', frame)
}
states.s312.id = 312
states.s313.p = function(step, frame) {
  step.returnCall('EXPR^11', frame)
}
states.s313.id = 313
states.s314.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s315)
  step.startCall('EXPR^1').addReturn(frame.context, states.s316)
}
states.s314.id = 314
states.s315.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s315)
  step.startCall('EXPR^1').addReturn(frame.context, states.s316)
}
states.s315.id = 315
states.s316.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s317)
  if (token === 41) {
    frame.addNextState(states.s318)
  }
}
states.s316.id = 316
states.s317.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s317)
  if (token === 41) {
    frame.addNextState(states.s318)
  }
}
states.s317.id = 317
states.s318.p = function(step, frame) {
  step.returnCall('EXPR^11', frame)
}
states.s318.id = 318
states.s319.p = function(step, frame) {
  step.startCall('IDENT').addReturn(frame.context, states.s320)
}
states.s319.id = 319
states.s320.p = function(step, frame) {
  step.addMark('param_end', frame.context, states.s321)
}
states.s320.id = 320
states.s321.p = function(step, frame) {
  step.returnCall('EXPR^11', frame)
}
states.s321.id = 321
states.s322.p = function(step, frame) {
  step.addMark('ident_end', frame.context, states.s323)
}
states.s322.id = 322
states.s323.p = function(step, frame) {
  step.returnCall('EXPR^11', frame)
}
states.s323.id = 323
states.s324.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s325)
  step.startCall('EXPR^9').addReturn(frame.context, states.s326)
}
states.s324.id = 324
states.s325.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s325)
  step.startCall('EXPR^9').addReturn(frame.context, states.s326)
}
states.s325.id = 325
states.s326.p = function(step, frame) {
  step.returnCall('EXPR^11', frame)
}
states.s326.id = 326
states.s327.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s328)
  step.startCall('EXPR^11').addReturn(frame.context, states.s329)
}
states.s327.id = 327
states.s328.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s328)
  step.startCall('EXPR^11').addReturn(frame.context, states.s329)
}
states.s328.id = 328
states.s329.p = function(step, frame) {
  step.returnCall('EXPR^11', frame)
}
states.s329.id = 329
states.s330.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s331)
  step.startCall('EXPR^11').addReturn(frame.context, states.s332)
}
states.s330.id = 330
states.s331.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s331)
  step.startCall('EXPR^11').addReturn(frame.context, states.s332)
}
states.s331.id = 331
states.s332.p = function(step, frame) {
  step.returnCall('EXPR^11', frame)
}
states.s332.id = 332
states.s333.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s334)
  step.startCall('EXPR^11').addReturn(frame.context, states.s335)
}
states.s333.id = 333
states.s334.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s334)
  step.startCall('EXPR^11').addReturn(frame.context, states.s335)
}
states.s334.id = 334
states.s335.p = function(step, frame) {
  step.returnCall('EXPR^11', frame)
}
states.s335.id = 335
states.s336.p = function(step, frame) {
  var token = step.token
  if (token === 45) {
    frame.addNextState(states.s337)
  }
}
states.s336.id = 336
states.s337.p = function(step, frame) {
  var token = step.token
  if (token === 62) {
    frame.addNextState(states.s338)
  }
}
states.s337.id = 337
states.s338.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s339)
  step.addMark('deref_field', frame.context, states.s340)
  step.returnCall('EXPR^11', frame)
}
states.s338.id = 338
states.s339.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s339)
  step.addMark('deref_field', frame.context, states.s340)
}
states.s339.id = 339
states.s340.p = function(step, frame) {
  step.startCall('IDENT').addReturn(frame.context, states.s341)
}
states.s340.id = 340
states.s341.p = function(step, frame) {
  step.addMark('end', frame.context, states.s342)
}
states.s341.id = 341
states.s342.p = function(step, frame) {
  step.returnCall('EXPR^11', frame)
}
states.s342.id = 342
states.s343.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s344)
  if (token === 46) {
    frame.addNextState(states.s345)
  }
}
states.s343.id = 343
states.s344.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s344)
  if (token === 46) {
    frame.addNextState(states.s345)
  }
}
states.s344.id = 344
states.s345.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s346)
  if (token === 91) {
    frame.addNextState(states.s347)
  }
}
states.s345.id = 345
states.s346.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s346)
  if (token === 91) {
    frame.addNextState(states.s347)
  }
}
states.s346.id = 346
states.s347.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s348)
  step.startCall('EXPR^1').addReturn(frame.context, states.s349)
}
states.s347.id = 347
states.s348.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s348)
  step.startCall('EXPR^1').addReturn(frame.context, states.s349)
}
states.s348.id = 348
states.s349.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s350)
  if (token === 93) {
    frame.addNextState(states.s351)
  }
}
states.s349.id = 349
states.s350.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s350)
  if (token === 93) {
    frame.addNextState(states.s351)
  }
}
states.s350.id = 350
states.s351.p = function(step, frame) {
  step.returnCall('EXPR^11', frame)
}
states.s351.id = 351
states.s352.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s353)
  if (token === 46) {
    frame.addNextState(states.s354)
  }
}
states.s352.id = 352
states.s353.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s353)
  if (token === 46) {
    frame.addNextState(states.s354)
  }
}
states.s353.id = 353
states.s354.p = function(step, frame) {
  step.addMark('ident', frame.context, states.s355)
}
states.s354.id = 354
states.s355.p = function(step, frame) {
  step.startCall('IDENT').addReturn(frame.context, states.s356)
}
states.s355.id = 355
states.s356.p = function(step, frame) {
  step.addMark('ident_end', frame.context, states.s357)
}
states.s356.id = 356
states.s357.p = function(step, frame) {
  step.returnCall('EXPR^11', frame)
}
states.s357.id = 357
states.s358.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s359)
  step.startCall('PIPE').addReturn(frame.context, states.s360)
}
states.s358.id = 358
states.s359.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s359)
  step.startCall('PIPE').addReturn(frame.context, states.s360)
}
states.s359.id = 359
states.s360.p = function(step, frame) {
  step.startCall('FUNC_CALL').addReturn(frame.context, states.s361)
}
states.s360.id = 360
states.s361.p = function(step, frame) {
  step.returnCall('EXPR^11', frame)
}
states.s361.id = 361
states.s362.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s363)
  step.startCall('PIPE').addReturn(frame.context, states.s364)
  step.startCall('OBJECT').addReturn(frame.context, states.s365)
}
states.s362.id = 362
states.s363.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s363)
  step.startCall('PIPE').addReturn(frame.context, states.s364)
  step.startCall('OBJECT').addReturn(frame.context, states.s365)
}
states.s363.id = 363
states.s364.p = function(step, frame) {
  step.startCall('OBJECT').addReturn(frame.context, states.s365)
}
states.s364.id = 364
states.s365.p = function(step, frame) {
  step.returnCall('EXPR^11', frame)
}
states.s365.id = 365
states.s366.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s367)
  step.startCall('PIPE').addReturn(frame.context, states.s368)
  if (token === 91) {
    frame.addNextState(states.s369)
  }
}
states.s366.id = 366
states.s367.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s367)
  step.startCall('PIPE').addReturn(frame.context, states.s368)
  if (token === 91) {
    frame.addNextState(states.s369)
  }
}
states.s367.id = 367
states.s368.p = function(step, frame) {
  var token = step.token
  if (token === 91) {
    frame.addNextState(states.s369)
  }
}
states.s368.id = 368
states.s369.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s370)
  step.startCall('EXPR^1').addReturn(frame.context, states.s371)
}
states.s369.id = 369
states.s370.p = function(step, frame) {
  step.startCall('IGN').addReturn(frame.context, states.s370)
  step.startCall('EXPR^1').addReturn(frame.context, states.s371)
}
states.s370.id = 370
states.s371.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s372)
  if (token === 93) {
    frame.addNextState(states.s373)
  }
}
states.s371.id = 371
states.s372.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s372)
  if (token === 93) {
    frame.addNextState(states.s373)
  }
}
states.s372.id = 372
states.s373.p = function(step, frame) {
  step.returnCall('EXPR^11', frame)
}
states.s373.id = 373
states.s374.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s375)
  step.startCall('PIPE').addReturn(frame.context, states.s376)
  if (token === 91) {
    frame.addNextState(states.s377)
  }
}
states.s374.id = 374
states.s375.p = function(step, frame) {
  var token = step.token
  step.startCall('IGN').addReturn(frame.context, states.s375)
  step.startCall('PIPE').addReturn(frame.context, states.s376)
  if (token === 91) {
    frame.addNextState(states.s377)
  }
}
states.s375.id = 375
states.s376.p = function(step, frame) {
  var token = step.token
  if (token === 91) {
    frame.addNextState(states.s377)
  }
}
states.s376.id = 376
states.s377.p = function(step, frame) {
  var token = step.token
  if (token === 93) {
    frame.addNextState(states.s378)
  }
}
states.s377.id = 377
states.s378.p = function(step, frame) {
  step.returnCall('EXPR^11', frame)
}
states.s378.id = 378

const initialContext = new Context(null, null)
const initialFrame = new Frame(initialContext)
initialFrame.addNextState(states.s0)
const initialFrames = [initialFrame]
const ruleInitialStates: {[key: string]: State[]} = {}
ruleInitialStates['main'] = [states.s2]
ruleInitialStates['SPACE'] = [states.s6]
ruleInitialStates['COMMENT'] = [states.s15]
ruleInitialStates['COMMENT_END'] = [states.s21]
ruleInitialStates['IGN'] = [states.s23]
ruleInitialStates['PIPE'] = [states.s26]
ruleInitialStates['PARENT'] = [states.s29]
ruleInitialStates['IDENT_FST'] = [states.s36]
ruleInitialStates['IDENT_REST'] = [states.s40]
ruleInitialStates['IDENT'] = [states.s43]
ruleInitialStates['STAR'] = [states.s46]
ruleInitialStates['COMP_OP'] = [states.s48]
ruleInitialStates['FUNC_CALL'] = [states.s66]
ruleInitialStates['FUNC_ARGS'] = [states.s76]
ruleInitialStates['NUMBER'] = [states.s83]
ruleInitialStates['DIGIT'] = [states.s101]
ruleInitialStates['SIGN'] = [states.s103]
ruleInitialStates['STRING'] = [states.s106]
ruleInitialStates['DSTRING_CHAR'] = [states.s117]
ruleInitialStates['SSTRING_CHAR'] = [states.s121]
ruleInitialStates['ARRAY'] = [states.s125]
ruleInitialStates['ARRAY_ELEMENT'] = [states.s139]
ruleInitialStates['OBJECT'] = [states.s146]
ruleInitialStates['OBJECT_PAIR'] = [states.s160]
ruleInitialStates['EXPR^1'] = [states.s179]
ruleInitialStates['EXPR^2'] = [states.s188]
ruleInitialStates['EXPR^3'] = [states.s197]
ruleInitialStates['EXPR^4'] = [states.s206]
ruleInitialStates['EXPR^5'] = [states.s229]
ruleInitialStates['EXPR^6'] = [states.s246]
ruleInitialStates['EXPR^7'] = [states.s260]
ruleInitialStates['EXPR^9'] = [states.s280]
ruleInitialStates['EXPR^11'] = [states.s289]
