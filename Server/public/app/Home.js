import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class Home extends Component {
	constructor (props) {
		super (props);
	}
    render () {
      return (
        <div style={{marginTop: '40px'}}>
          <div className="row">
            <div className="col-md-2"></div>
            <div className="col-md-8">
              <h1>Hi, 王小明 醫生</h1>
            </div>
            <div className="col-md-2"></div>
          </div>
          <div className="row" style={{marginTop: 40}}>
            
            <form className="form-horizontal" role="form">
              <h2 className="col-md-offset-2">新增病人資料</h2>
              <div className="form-group">
                <label htmlFor="inputEmail3" className="col-md-2 control-label">病人ID</label>
                <div className="col-md-8">
                  <input type="text" className="form-control" id="inputEmail3" placeholder="輸入病人ID"/>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="inputPassword3" className="col-md-2 control-label">姓名</label>
                <div className="col-md-8">
                  <input type="text" className="form-control" id="inputPassword3" placeholder="輸入姓名"/>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="inputPassword3" className="col-md-2 control-label">年齡</label>
                <div className="col-md-8">
                  <select className="form-control" id="inputPassword3" placeholder="輸入年齡">
                    <option>20</option>
                    <option>21</option>
                    <option>22</option>
                    <option>23</option>
                    <option>24</option>
                    <option>25</option>
                    <option>26</option>
                    <option>27</option>
                    <option>28</option>
                    <option>29</option>
                    <option>30</option>
                    <option>31</option>
                    <option>32</option>
                    <option>33</option>
                    <option>34</option>
                    <option>35</option>
                    <option>36</option>
                    <option>37</option>
                    <option>38</option>
                    <option>39</option>
                    <option>40</option>
                    <option>41</option>
                    <option>42</option>
                    <option>43</option>
                    <option>44</option>
                    <option>45</option>
                    <option>46</option>
                    <option>47</option>
                    <option>48</option>
                    <option>49</option>
                    <option>50</option>
                    <option>51</option>
                    <option>52</option>
                    <option>53</option>
                    <option>54</option>
                    <option>55</option>
                    <option>56</option>
                    <option>57</option>
                    <option>58</option>
                    <option>59</option>
                    <option>60</option>
                    <option>61</option>
                    <option>62</option>
                    <option>63</option>
                    <option>64</option>
                    <option>65</option>
                    <option>66</option>
                    <option>67</option>
                    <option>68</option>
                    <option>69</option>
                    <option>70</option>
                    <option>71</option>
                    <option>72</option>
                    <option>73</option>
                    <option>74</option>
                    <option>75</option>
                    <option>76</option>
                    <option>77</option>
                    <option>78</option>
                    <option>79</option>
                    <option>80</option>
                    <option>81</option>
                    <option>82</option>
                    <option>83</option>
                    <option>84</option>
                    <option>85</option>
                    <option>86</option>
                    <option>87</option>
                    <option>88</option>
                    <option>89</option>
                    <option>90</option>
                    <option>91</option>
                    <option>92</option>
                    <option>93</option>
                    <option>94</option>
                    <option>95</option>
                    <option>96</option>
                    <option>97</option>
                    <option>98</option>
                    <option>99</option>
                    <option>100</option>

                  </select>
                </div>
              </div>

              <div className="form-group">
                <div className="col-md-offset-2 col-md-10">
                  <div className="checkbox">
                    <label>
                      <input type="checkbox"/> 男
                    </label>
                    <label style={{marginLeft: 10}}>
                      <input type="checkbox"/> 女
                    </label>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <div className="col-md-offset-2 col-md-10">
                  <button type="submit" className="btn btn-default">登入</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      );
    }
}

export default Home;