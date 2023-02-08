var db = require("./views/Scripts/db");
exports.user = {};

exports.auth = function (request, response) {
  let username = request.body.username;
  let password = request.body.password;
  let loginType = request.body.select;
  if (username && password && loginType) {
    let query = "";
    if (loginType == "Faculty") {
      query = "SELECT * FROM faculty WHERE email = ? AND password = ?";
    } else {
      query = "SELECT * FROM student WHERE email = ? AND password = ?";
    }
    db.connection.query(
      query,
      [username, password],
      function (error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
          request.session.loggedin = true;
          request.session.username = username;
          exports.user = results[0];
          exports.user.loggedin = true;
          exports.user.loginType = loginType;
          response.redirect("/Dashboard");
        } else {
          response.send("Incorrect Username and/or Password!");
        }
        response.end();
      }
    );
  } else {
    response.send("Please enter Username and Password!");
    response.end();
  }
};

exports.register = function (request, response) {
  let username = request.body.username;
  let password = request.body.password;
  let fullName = request.body.fullName;
  let studentId = request.body.studentId;
  let mobileNumber = request.body.mobileNumber;
  if (username && password && fullName && parseInt(studentId) && mobileNumber) {
    let sql_mobile = "INSERT INTO mobile (mobile) VALUES (?)";
    db.connection.query(
      sql_mobile,
      [parseInt(mobileNumber)],
      function (err, result) {
        if (err) throw err;

        if (result.insertId) {
          let sql_student = "INSERT INTO student VALUES (?,?,?,?,?)";
          let values_student = [
            parseInt(studentId),
            fullName,
            username,
            password,
            result.insertId,
          ];
          db.connection.query(
            sql_student,
            values_student,
            function (err, result) {
              if (err) throw err;
              if (result) {
                response.redirect("/");
              }
            }
          );
        }
      }
    );
  }
};

exports.profile = function (request, response) {
  db.connection.query(
    "select mobile.student_id, mobile.mobile, internship.company_id, internship.domain, internship.internship_id from internship inner join mobile on mobile.student_id=internship.student_id and mobile.student_id= ?",
    [exports.user.student_id],
    function (error, results, fields) {
      if (error) throw error;
      if (results.length > 0) {
        exports.user.mobile = results[0].mobile;
        exports.user.domain = results[0].domain;
        response.render("profile", {
          name: exports.user.name,
          student_id: exports.user.student_id,
          mobile: exports.user.mobile,
          email: exports.user.email,
          domain: exports.user.domain,
          loginType: exports.user.loginType,
        });
      }
    }
  );
};

exports.Internship = function (request, response) {
  db.connection.query(
    "select internship.student_id, internship.internship_id, internship.company_id,internship.company_email,internship.company, internship.domain,mobile.mobile  from internship inner join mobile on  internship.student_id=mobile.student_id and internship.student_id= ?",
    [exports.user.student_id],
    function (error, results, fields) {
      if (error) throw error;
      if (results.length > 0) {
        exports.user.mobile = results[0].mobile;
        exports.user.internship_id = results[0].internship_id;
        exports.user.company_id = results[0].company_id;
        exports.user.domain = results[0].domain;
        exports.user.company_email = results[0].company_email;
        exports.user.company = results[0].company;
        response.render("internship", {
          name: exports.user.name,
          student_id: exports.user.student_id,
          mobile: exports.user.mobile,
          email: exports.user.email,
          internship_id: exports.user.internship_id,
          company_id: exports.user.company_id,
          domain: exports.user.domain,
          company_email: exports.user.company_email,
          company: exports.user.company,
          loginType: exports.user.loginType,
        });
      }
    }
  );
};

exports.LoanDetails = function (request, response) {
  db.connection.query(
    "select bank.bank_id,bank.name,bank.email,loan.loan_id, loan.amount from bank inner join loan on bank.student_id=loan.student_id and loan.student_id=?",
    [exports.user.student_id],
    function (error, results, fields) {
      if (error) throw error;
      if (results.length > 0) {
        exports.user.bank_id = results[0].bank_id;
        exports.user.bank_name = results[0].name;
        exports.user.bank_email = results[0].email;
        exports.user.loan_id = results[0].loan_id;
        exports.user.loan_amount = results[0].amount;
        response.render("loanDetails", {
          name: exports.user.name,
          bank_id: exports.user.bank_id,
          bank_name: exports.user.bank_name,
          bank_email: exports.user.bank_email,
          loan_id: exports.user.loan_id,
          loan_amount: exports.user.loan_amount,
          loginType: exports.user.loginType,
        });
      }
    }
  );
};

exports.Queries = function (request, response) {
  db.connection.query(
    "select queries.query_id,queries.student_id,queries.title,queries.domain,queries.description,answer.ans_description from queries inner join answer on queries.query_id= answer.query_id and queries.student_id=?;",
    [exports.user.student_id],
    function (error, results, fields) {
      if (error) throw error;
      if (results.length > 0) {
        answeredQuestions = results.filter(function (el) {
          return el.ans_description;
        });
        unAnsweredQuestions = results.filter(function (el) {
          return !el.ans_description;
        });
        exports.user.answeredQuestions = answeredQuestions;
        exports.user.unAnsweredQuestions = unAnsweredQuestions;
        response.render("Queries", {
          answeredQuestions: exports.user.answeredQuestions,
          unAnsweredQuestions: exports.user.unAnsweredQuestions,
          loginType: exports.user.loginType,
        });
      }
    }
  );
};

exports.AddQuestion = function (request, response) {
  let Question = request.body.Question;
  let Domain = request.body.Domain;

  if (Question && Domain && parseInt(exports.user.student_id)) {
    let sql_student =
      "INSERT INTO queries (student_id,domain,description,faculty_id) VALUES (?,?,?,?)";
    let values_student = [exports.user.student_id, Domain, Question, 1];
    db.connection.query(sql_student, values_student, function (err, result) {
      if (err) throw err;
      if (result) {
        if (result.insertId) {
          let sql_student =
            "INSERT INTO answer (query_id,faculty_id,student_id) VALUES (?,?,?)";
          let values_student = [result.insertId, 1, exports.user.student_id];
          db.connection.query(
            sql_student,
            values_student,
            function (err, result) {
              if (err) throw err;
              if (result) {
                response.redirect("/Queries");
              }
            }
          );
        }
      }
    });
  }
};

exports.FDashboard = function (request, response) {
  db.connection.query(
    "select queries.description, answer.ans_description, queries.query_id, queries.title, queries.domain, queries.student_id,answer.answer_id, faculty.faculty_id from queries join answer on answer.query_id=queries.query_id join faculty ON answer.faculty_id = faculty.faculty_id and faculty.faculty_id=?;",
    [exports.user.faculty_id],
    function (error, results, fields) {
      if (error) throw error;
      if (results.length > 0) {
        answeredQuestions = results.filter(function (el) {
          return el.ans_description;
        });
        unAnsweredQuestions = results.filter(function (el) {
          return !el.ans_description;
        });
        exports.user.answeredQuestions = answeredQuestions;
        exports.user.unAnsweredQuestions = unAnsweredQuestions;

        response.render("FDashboard", {
          name: exports.user.name,
          faculty_id: exports.user.faculty_id,
          email: exports.user.email,
          answeredQuestions: exports.user.answeredQuestions,
          unAnsweredQuestions: exports.user.unAnsweredQuestions,
          loginType: exports.user.loginType,
        });
      }
    }
  );
};

exports.AddAnswer = function (request, response) {
  let Answer = request.body["Answer" + request.query.key];
  if (Answer) {
    let sql_student = "UPDATE answer SET ans_description=? WHERE query_id=?;";
    let values_student = [String(Answer), request.query.answering_id];
    db.connection.query(sql_student, values_student, function (err, result) {
      if (err) throw err;
      if (result) {
        response.redirect("/FDashboard");
      }
    });
  }
};

exports.Dashboard = function (request, response) {
  db.connection.query(
    "select * from university where student_id= ?",
    [exports.user.student_id],
    function (error, results, fields) {
      if (error) throw error;
      if (results.length > 0) {
        exports.user.university = {};
        exports.user.university.mobile = results[0].mobile;
        exports.user.university.name = results[0].name;
        exports.user.university.email = results[0].email;
        exports.user.university.university_id = results[0].university_id;
        response.render("Dashboard", {
          name: exports.user.university.name,
          university_id: exports.user.university.university_id,
          mobile: exports.user.university.mobile,
          email: exports.user.university.email,
          loginType: exports.user.loginType,
        });
      }
    }
  );
};
