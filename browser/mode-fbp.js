define("ace/mode/fbp_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var FBPHighlightRules = function() {

    this.$rules = {
        start: [{
            token: "string.quoted.fbp",
            regex: /'.+'/,
            comment: "IIP string"
        }, {
            token: "keyword.operator.connection.fbp",
            regex: /->/,
            comment: "Operator"
        }, {
            token: [
                "entity.name.function.port.fbp",
                "variable.expression.fbp",
                "entity.name.tag.component.fbp",
                "storage.type.fbp",
                "variable.expression.fbp",
                "entity.name.function.port.fbp"
            ],
            regex: /([A-Z0-9]+)( )(\w+)((?:\([\w\/\.\-]+\))?)(?:( )([A-Z0-9]+))?/,
            comment: "Component with port on the left (optionally on the right too)"
        }, {
            token: [
                "entity.name.function.port.fbp",
                "variable.expression.fbp",
                "entity.name.tag.component.fbp",
                "storage.type.fbp",
                "variable.expression.fbp",
                "entity.name.function.port.fbp"
            ],
            regex: /(?:([A-Z0-9]+)( ))?(\w+)((?:\([\w\/\.\-]+\))?)( )([A-Z0-9]+)/,
            comment: "Component with port on the right (optionally on the left too)"
        }, {
            token: "comment.source.fbp",
            regex: /#.*/,
            comment: "Comment"
        }, {
            token: [
                "constant.language.fbp",
                "keyword.operator.declaration.fbp",
                "variable.component.fbp",
                "keyword.operator.access.fbp",
                "entity.name.function.port.fbp",
                "keyword.operator.naming.fbp",
                "entity.name.fbp"
            ],
            regex: /((?:IN|OUT|EX)PORT)(=)(\w+)(\.)([A-Z0-9]+)(:)([A-Z0-9]+)/,
            comment: "External port declaration"
        }]
    }

    this.normalizeRules();
};

FBPHighlightRules.metaData = {
    fileTypes: ["fbp"],
    name: "FBP",
    scopeName: "source.fbp"
}


oop.inherits(FBPHighlightRules, TextHighlightRules);

exports.FBPHighlightRules = FBPHighlightRules;
});

define("ace/mode/folding/cstyle",["require","exports","module","ace/lib/oop","ace/range","ace/mode/folding/fold_mode"], function(require, exports, module) {
"use strict";

var oop = require("../../lib/oop");
var Range = require("../../range").Range;
var BaseFoldMode = require("./fold_mode").FoldMode;

var FoldMode = exports.FoldMode = function(commentRegex) {
    if (commentRegex) {
        this.foldingStartMarker = new RegExp(
            this.foldingStartMarker.source.replace(/\|[^|]*?$/, "|" + commentRegex.start)
        );
        this.foldingStopMarker = new RegExp(
            this.foldingStopMarker.source.replace(/\|[^|]*?$/, "|" + commentRegex.end)
        );
    }
};
oop.inherits(FoldMode, BaseFoldMode);

(function() {

    this.foldingStartMarker = /(\{|\[)[^\}\]]*$|^\s*(\/\*)/;
    this.foldingStopMarker = /^[^\[\{]*(\}|\])|^[\s\*]*(\*\/)/;
    this.singleLineBlockCommentRe= /^\s*(\/\*).*\*\/\s*$/;
    this.tripleStarBlockCommentRe = /^\s*(\/\*\*\*).*\*\/\s*$/;
    this.startRegionRe = /^\s*(\/\*|\/\/)#?region\b/;
    this._getFoldWidgetBase = this.getFoldWidget;
    this.getFoldWidget = function(session, foldStyle, row) {
        var line = session.getLine(row);

        if (this.singleLineBlockCommentRe.test(line)) {
            if (!this.startRegionRe.test(line) && !this.tripleStarBlockCommentRe.test(line))
                return "";
        }

        var fw = this._getFoldWidgetBase(session, foldStyle, row);

        if (!fw && this.startRegionRe.test(line))
            return "start"; // lineCommentRegionStart

        return fw;
    };

    this.getFoldWidgetRange = function(session, foldStyle, row, forceMultiline) {
        var line = session.getLine(row);

        if (this.startRegionRe.test(line))
            return this.getCommentRegionBlock(session, line, row);

        var match = line.match(this.foldingStartMarker);
        if (match) {
            var i = match.index;

            if (match[1])
                return this.openingBracketBlock(session, match[1], row, i);

            var range = session.getCommentFoldRange(row, i + match[0].length, 1);

            if (range && !range.isMultiLine()) {
                if (forceMultiline) {
                    range = this.getSectionRange(session, row);
                } else if (foldStyle != "all")
                    range = null;
            }

            return range;
        }

        if (foldStyle === "markbegin")
            return;

        var match = line.match(this.foldingStopMarker);
        if (match) {
            var i = match.index + match[0].length;

            if (match[1])
                return this.closingBracketBlock(session, match[1], row, i);

            return session.getCommentFoldRange(row, i, -1);
        }
    };

    this.getSectionRange = function(session, row) {
        var line = session.getLine(row);
        var startIndent = line.search(/\S/);
        var startRow = row;
        var startColumn = line.length;
        row = row + 1;
        var endRow = row;
        var maxRow = session.getLength();
        while (++row < maxRow) {
            line = session.getLine(row);
            var indent = line.search(/\S/);
            if (indent === -1)
                continue;
            if  (startIndent > indent)
                break;
            var subRange = this.getFoldWidgetRange(session, "all", row);

            if (subRange) {
                if (subRange.start.row <= startRow) {
                    break;
                } else if (subRange.isMultiLine()) {
                    row = subRange.end.row;
                } else if (startIndent == indent) {
                    break;
                }
            }
            endRow = row;
        }

        return new Range(startRow, startColumn, endRow, session.getLine(endRow).length);
    };
    this.getCommentRegionBlock = function(session, line, row) {
        var startColumn = line.search(/\s*$/);
        var maxRow = session.getLength();
        var startRow = row;

        var re = /^\s*(?:\/\*|\/\/|--)#?(end)?region\b/;
        var depth = 1;
        while (++row < maxRow) {
            line = session.getLine(row);
            var m = re.exec(line);
            if (!m) continue;
            if (m[1]) depth--;
            else depth++;

            if (!depth) break;
        }

        var endRow = row;
        if (endRow > startRow) {
            return new Range(startRow, startColumn, endRow, line.length);
        }
    };

}).call(FoldMode.prototype);

});

define("ace/mode/fbp",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/fbp_highlight_rules","ace/mode/folding/cstyle"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var FBPHighlightRules = require("./fbp_highlight_rules").FBPHighlightRules;
var FoldMode = require("./folding/cstyle").FoldMode;

var Mode = function() {
    this.HighlightRules = FBPHighlightRules;
    this.foldingRules = new FoldMode();
};
oop.inherits(Mode, TextMode);

(function() {
    this.$id = "ace/mode/fbp"
}).call(Mode.prototype);

exports.Mode = Mode;
});
