function Board() {
    this.questions = [];
    this.questionRuleArr = [];
    this.cardsArr = [];

    //sample question
    var q1 = "Coca-Cola and Pepsi are selling similar products. Each must decide on a pricing strategy.";
    this.questions.push(q1); 

    var q2 = "The police have captured two criminals and are interrogating them in separate rooms, so they can't communicate with each other. They offer each the following deal: If both cooperate, both get 1 year. If both defect, both get 2 years. If one cooperates and one defects, the defected person will get 0 year(free) and another person gets 3 years."
    this.questions.push(q2);

    //q1 question rule
    this.questionRule = {
        cooperateCooperate: [500,500],
        cooperateDefect: [0,750],
        defectCooperate: [750,0],
        defectDefect: [250,250]
    };
    this.questionRuleArr.push(this.questionRule);

    //q2 question rule
    this.questionRule = {
        cooperateCooperate: [-1,-1],
        cooperateDefect: [-3,0],
        defectCooperate: [0,-3],
        defectDefect: [-2,-2]
    };
    this.questionRuleArr.push(this.questionRule);

}

exports.Board = Board;